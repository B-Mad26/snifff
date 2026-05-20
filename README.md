# Snifff — Production Monorepo

The pet social & dating super-app. Single repo, four apps, one platform.

## Stack
- **Mobile:** React Native (Expo SDK 50) + Reanimated 3 — iOS + Android
- **Web:** Next.js 14 (App Router) + Tailwind CSS — public site + SSR pet profiles
- **Admin:** Next.js 14 + Tailwind — moderation + analytics
- **API:** NestJS 10 + Prisma + Socket.io — REST + WebSockets
- **DB:** PostgreSQL 16 + PostGIS + pgvector (for embeddings)
- **Cache / Queues:** Redis + BullMQ
- **Storage:** Cloudflare R2 (S3-compatible)
- **AI:** Anthropic Claude (LLM) + custom PyTorch breed classifier (deployed via Replicate)
- **Payments:** Stripe + RevenueCat (mobile in-app)
- **Auth:** JWT (rotating refresh) + OAuth (Apple/Google/Facebook) + Twilio Verify (phone OTP)
- **Orchestration:** Turborepo + pnpm workspaces
- **CI:** GitHub Actions
- **IaC:** Terraform (AWS ECS + RDS + ElastiCache + CloudFront)

## Repo Layout

```
snifff/
├── apps/
│   ├── api/        NestJS API + WebSocket gateway
│   ├── mobile/     React Native (Expo)
│   ├── web/        Next.js marketing + public profiles
│   └── admin/      Next.js admin dashboard
├── packages/
│   └── shared/     types, validators, constants shared across apps
├── infra/
│   ├── terraform/  AWS infrastructure as code
│   └── docker/     Dockerfiles
└── .github/workflows/   CI/CD
```

## Quickstart (local dev)

```bash
# Prereqs: Node 20, pnpm 9, Docker, PostgreSQL 16, Redis 7
git clone <this-repo>
cd snifff
pnpm install
cp .env.example .env            # then fill in values
docker compose up -d postgres redis
pnpm --filter @snifff/api prisma:migrate:dev
pnpm --filter @snifff/api prisma:seed
pnpm dev                        # boots api, web, admin, mobile in parallel
```

Mobile: `pnpm --filter @snifff/mobile start` → press `i` for iOS sim or `a` for Android.

## API Endpoints (high-level)

| Module       | Routes                                                          |
|--------------|-----------------------------------------------------------------|
| auth         | POST `/auth/otp/send`, `/auth/otp/verify`, `/auth/refresh`, `/auth/oauth/:provider`  |
| users        | GET/PATCH `/users/me`, GET `/users/:id`, POST `/users/me/verify-id` |
| pets         | CRUD `/pets`, POST `/pets/:id/photos`, POST `/pets/:id/ai-bio`  |
| swipes       | POST `/swipes` (sniff / super / pass)                          |
| matches      | GET `/matches`, DELETE `/matches/:id`                          |
| chats       | GET `/chats`, GET `/chats/:id/messages`, POST `/chats/:id/messages` |
| posts       | CRUD `/posts`, POST `/posts/:id/like`, POST `/posts/:id/comments` |
| feed        | GET `/feed/tails`, GET `/feed/discover`                        |
| notifications | GET `/notifications`, POST `/notifications/read-all`         |
| payments    | POST `/payments/subscribe`, Webhook `/payments/webhook`         |
| moderation  | POST `/reports`, internal `/moderation/queue` (admin)           |
| ai          | POST `/ai/bio`, POST `/ai/breed-id`, POST `/ai/caption`         |
| uploads     | POST `/uploads/sign` (presigned R2 URLs)                        |

WebSocket gateway at `/ws` — events: `message:new`, `match:new`, `typing`, `presence`.

## Database

Full Prisma schema in `apps/api/prisma/schema.prisma`. Highlights:
- `User`, `Pet`, `Breeder`, `Litter`
- `Swipe`, `Match`, `Chat`, `Message`
- `Post`, `PostLike`, `PostComment`, `Follow`
- `Report`, `ModerationAction`, `Notification`
- `SubscriptionPlan`, `Subscription`, `CoinTransaction`
- `PetEmbedding` (pgvector 384-dim), `RecommendationLog`

## AI Surfaces

| Feature             | Where it lives                            |
|---------------------|-------------------------------------------|
| Bio generation      | `modules/ai/services/bio.service.ts`     |
| Breed identification | `modules/ai/services/breed.service.ts`  |
| Caption suggestion   | `modules/ai/services/caption.service.ts` |
| Toxicity moderation  | `modules/moderation/services/toxicity.service.ts` |
| Image NSFW + abuse   | `modules/moderation/services/image.service.ts` |
| Match recommendations | `modules/matches/services/recommend.service.ts` (two-tower model, Pinecone) |

## Deployment

- **API:** AWS ECS Fargate behind ALB; auto-scaled on CPU/RPS
- **Web + Admin:** Vercel (Next.js)
- **Mobile:** EAS Build → TestFlight / Play Internal → Production
- **DB:** AWS RDS Aurora Postgres (Multi-AZ) + PostGIS + pgvector extensions
- **Redis:** ElastiCache cluster
- **CDN:** Cloudflare (R2 origin)
- **Observability:** Datadog + Sentry + PostHog

See `infra/terraform/` for the canonical infrastructure.

## Roadmap

- **Phase 1 (M0–6):** MVP — Auth, single pet, Friends swipe, chat, basic feed
- **Phase 2 (M7–12):** Tails, Stories, Adoption Mode, Snifff+ paywall, multi-pet, AI tools
- **Phase 3 (M13–24):** Breeding Mode, Lost Pet, Playdate, Marketplace, Live Bark
- **Phase 4 (M25–48):** Snifff Vet/Travel/Insurance, regional M&A

## License

Proprietary. © 2026 Snifff. All rights reserved.
