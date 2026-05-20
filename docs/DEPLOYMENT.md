# Snifff — Deployment Runbook

> First-time setup → production rollout → daily ops.

---

## 1. Environments

| Env | Purpose | URL | Branch |
|---|---|---|---|
| `dev` | Local | localhost | feature branches |
| `preview` | Per-PR | `*.snifff-preview.app` | PR auto |
| `staging` | Pre-prod | `staging.snifff.app` | `develop` |
| `prod` | Public | `snifff.app` | `main` |

All envs use the same code paths; only secrets and feature flags differ.

---

## 2. First-time AWS Setup

```bash
cd infra/terraform
terraform init
terraform workspace new prod
terraform plan -var-file=prod.tfvars
terraform apply
```

Creates:
- VPC (3 AZs, public + private subnets)
- ECS Fargate cluster `snifff-api`
- RDS Aurora Postgres (db.r6g.large primary + 1 read replica) with custom param group enabling `postgis`, `pgvector`, `pg_trgm`
- ElastiCache Redis (cluster mode, 3 shards × 2 replicas)
- ALB + ACM cert + Route53 records
- IAM roles, Secrets Manager, CloudWatch log groups

---

## 3. Secrets (Doppler / AWS Secrets Manager)

All required env vars — keep parity with `.env.example`:

```
# Core
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
JWT_ACCESS_SECRET=<256-bit>
JWT_REFRESH_SECRET=<256-bit>
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

# Twilio (OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

# OAuth
APPLE_CLIENT_ID=
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=

# Object storage (R2 / S3 compat)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=snifff-media
R2_PUBLIC_URL=https://cdn.snifff.app

# AI
ANTHROPIC_API_KEY=
REPLICATE_API_TOKEN=
PERSPECTIVE_API_KEY=

# Moderation
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# Push
FCM_SERVER_KEY=
APNS_KEY_ID=
APNS_TEAM_ID=
APNS_PRIVATE_KEY=

# Observability
DATADOG_API_KEY=
SENTRY_DSN=
POSTHOG_KEY=
```

**Never** commit secrets. CI reads from Doppler via `doppler run -- pnpm build`.

---

## 4. Database

### Migrations
```bash
pnpm --filter @snifff/api prisma:migrate          # apply pending
pnpm --filter @snifff/api prisma:migrate:create   # generate new from schema diff
pnpm --filter @snifff/api prisma:seed             # dev fixtures
```

### Prod migration policy
- Migrations land in a separate PR
- CI runs `prisma migrate diff` and posts the plan as a PR comment
- Manual approval required to apply in prod (GitHub Actions environment protection)
- Expand-contract pattern for destructive changes; never drop columns in the same release as code that stops reading them

### Backups
- Aurora automated daily snapshots, 30-day retention
- Logical exports of `users`, `pets`, `breeders` weekly to a separate AWS account (DR)

---

## 5. CI/CD

### `.github/workflows/ci.yml`
On every PR:
1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck` (Turbo, all apps)
3. `pnpm lint`
4. `pnpm test`
5. Build all apps; cache Turbo outputs
6. Bundle-size budget check for mobile

### `.github/workflows/eas-mobile.yml`
Manual trigger:
1. EAS Build iOS + Android with prod env
2. Submit to TestFlight + Play Internal
3. Slack notify on success

### API deploy
On merge to `main`:
1. Build Docker image, push to ECR
2. Update ECS service (rolling, max-surge 100%, deregister delay 30s)
3. Run smoke tests against ALB DNS

### Web + Admin deploy
- Vercel auto-deploy on push; preview URLs per PR

---

## 6. Mobile Release Flow

```
feature branch
  ↓ PR → develop (auto-build EAS preview)
develop
  ↓ tag `mobile-vX.Y.Z`
main
  ↓ workflow_dispatch on eas-mobile.yml
TestFlight + Play Internal
  ↓ QA sign-off
Promote to production tracks
```

OTA updates via `expo-updates` for JS-only changes; native changes require new binary submission.

---

## 7. Observability

- **Datadog APM** on api (NestJS auto-instrumentation)
- **Sentry** error capture in api + mobile + web (`SENTRY_DSN`)
- **PostHog** product analytics (feature flags, funnels, replay)
- **Cloudflare Real-User Monitoring** for web

### SLOs
| Surface | Target |
|---|---|
| API p95 latency | < 200ms |
| API error rate | < 0.5% |
| Swipe-stack p95 | < 100ms |
| Push delivery | < 30s end-to-end |
| Uptime | 99.95% monthly |

PagerDuty escalation on burn-rate alerts.

---

## 8. Incident Response

On-call rotation in PagerDuty: Engineering (primary) + Trust/Safety (secondary on T&S issues).

Runbook lives in `docs/RUNBOOKS/` (TODO post-launch). Severities:
- **SEV-1** total outage → 15min response, war room
- **SEV-2** degraded → 30min
- **SEV-3** partial → 2h
- **SEV-4** cosmetic → next business day

Post-mortems within 5 business days, published in `docs/POSTMORTEMS/`.

---

## 9. Cost Targets (Year 1)

| Service | Budget |
|---|---|
| AWS compute + RDS + ElastiCache | $8K/mo at 250K MAU |
| Cloudflare R2 + CDN | $2K/mo (egress-free is a key choice) |
| Anthropic + Replicate | $1.5K/mo (cached aggressively) |
| Mux video | $1K/mo |
| Twilio | $1K/mo |
| Observability | $1K/mo |
| **Total infra** | ~$15K/mo at 250K MAU → ~$0.06 per MAU |

At 5M MAU the per-MAU cost should drop below $0.02 due to R2 zero-egress and Postgres read-replica reuse.

---

## 10. Rollback

API: ECS supports instant rollback via task definition revision (`aws ecs update-service --task-definition <prev>`). Database migrations are expand-only — no schema rollback needed; only revert app code.

Mobile: OTA channel rollback via Expo (`eas update --branch production --message "rollback"`).
