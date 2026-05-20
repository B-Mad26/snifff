terraform {
  required_version = ">= 1.6"
  required_providers {
    aws        = { source = "hashicorp/aws",        version = "~> 5.40" }
    cloudflare = { source = "cloudflare/cloudflare", version = "~> 4.20" }
  }
  backend "s3" { bucket = "snifff-tf-state" key = "prod/terraform.tfstate" region = "us-east-1" }
}

provider "aws"        { region = var.aws_region }
provider "cloudflare" {}

variable "aws_region"   { default = "us-east-1" }
variable "environment"  { default = "prod" }

# --- VPC ---
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  name    = "snifff-${var.environment}"
  cidr    = "10.0.0.0/16"
  azs                = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  public_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets    = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
  enable_nat_gateway = true
}

# --- RDS Aurora Postgres (with PostGIS + pgvector via extensions) ---
resource "aws_rds_cluster" "main" {
  cluster_identifier      = "snifff-${var.environment}"
  engine                  = "aurora-postgresql"
  engine_version          = "16.2"
  database_name           = "snifff"
  master_username         = "snifff"
  master_password         = var.db_master_password
  vpc_security_group_ids  = [aws_security_group.db.id]
  db_subnet_group_name    = aws_db_subnet_group.main.name
  storage_encrypted       = true
  backup_retention_period = 14
  skip_final_snapshot     = false
  enabled_cloudwatch_logs_exports = ["postgresql"]
}

resource "aws_rds_cluster_instance" "main" {
  count              = 2
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.r6g.large"
  engine             = "aurora-postgresql"
  engine_version     = "16.2"
}

resource "aws_db_subnet_group" "main" {
  name       = "snifff-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "db" {
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 5432 to_port = 5432 protocol = "tcp" security_groups = [aws_security_group.ecs.id] }
}

variable "db_master_password" { sensitive = true }

# --- ElastiCache Redis ---
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "snifff-${var.environment}"
  description                = "Snifff Redis"
  node_type                  = "cache.r6g.large"
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.cache.id]
  engine_version             = "7.1"
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "snifff-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "cache" {
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 6379 to_port = 6379 protocol = "tcp" security_groups = [aws_security_group.ecs.id] }
}

# --- ECS Cluster (Fargate) ---
resource "aws_ecs_cluster" "main" {
  name = "snifff-${var.environment}"
  setting { name = "containerInsights" value = "enabled" }
}

resource "aws_security_group" "ecs" {
  vpc_id = module.vpc.vpc_id
  ingress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

# --- Outputs ---
output "rds_endpoint"   { value = aws_rds_cluster.main.endpoint }
output "redis_endpoint" { value = aws_elasticache_replication_group.main.primary_endpoint_address }
output "ecs_cluster_id" { value = aws_ecs_cluster.main.id }
