-- Snifff Postgres bootstrap: enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;     -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- fuzzy search
