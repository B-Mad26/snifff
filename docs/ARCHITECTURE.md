# Snifff — System Architecture

> The pet social & dating super-app. iOS + Android + Web + Admin, one monorepo, one platform team.

---

## 1. North-Star Goals

1. **Sub-100ms p95** for swipe-stack and feed endpoints
2. **50M MAU** scalable without re-architecture
3. **One codebase** for iOS + Android (React Native), one for web (Next.js)
4. **AI-first**: profile bios, breed ID, compatibility scoring, safety moderation — all automated
5. **Trust by design**: verified breeders, vet badges, ID verification, animal-welfare escalation

---

## 2. High-Level Topology

```
                                       ┌─────────────────────────────┐
                                       │  Cloudflare (CDN + WAF + R2)│
                                       └─────────────┬───────────────┘
                                                     │
   ┌──────────────┐    ┌──────────────┐    ┌─────────▼──────────┐    ┌──────────────┐
   │  iOS / RN    │    │ Android / RN │    │  Next.js Web (SSR) │    │ Admin (Next) │
   └──────┬───────┘    └──────┬───────┘    └─────────┬──────────┘    └──────┬───────┘
          │                   │                      │                       │
          └───────────────────┴──────────┬───────────┴───────────────────────┘
                                         │ HTTPS (REST + GraphQL) + WSS
                                ┌────────▼─────────┐
                                │   API Gateway    │  rate-limit, auth, observability
                                │  (AWS ALB + NGI) │
                                └────────┬─────────┘
                                         │
            ┌────────────────────────────┼─────────────────────────────┐
            │                            │                             │
   ┌────────▼─────┐         ┌────────────▼────────────┐    ┌───────────▼───────────┐
   │ NestJS API   │         │  Chat WS Gateway        │    │  ML Inference         │
   │ (modular)    │         │  Socket.io + Redis pub  │    │  (Modal / Replicate)  │
   └────────┬─────┘         └────────────┬────────────┘    └───────────┬───────────┘
            │                            │                             │
   ┌────────▼─────────────────────────────────────────────────┐        │
   │  Domain Services (NestJS modules)                        │        │
   │  auth · users · pets · swipes · matches · chats · posts  │        │
   │  feed · ai · moderation · notifications · payments       │        │
   │  reports · breeders · uploads                            │        │
   └─┬────────┬────────┬─────────┬──────────┬────────────────┘        │
     │        │        │         │          │                          │
   ┌─▼──┐  ┌──▼──┐  ┌──▼───┐  ┌──▼─────┐  ┌─▼────────┐                 │
   │PG  │  │Redis│  │Kafka │  │Cloudflare R2│ │MeiliSearch│            │
   │16  │  │     │  │      │  │(S3 API)     │ │            │           │
   │+   │  │BullMQ│ │event │  │photos/video │ │full-text   │           │
   │PostGIS│jobs │  │stream│  └─────────────┘ └────────────┘           │
   │+vec│  │cache│  └──┬───┘                                            │
   └────┘  └─────┘     │                                                │
                       └────────────► BigQuery (analytics + ML training)─┘
```

---

## 3. Repository Layout

```
snifff/
├── apps/
│   ├── api/           NestJS 10 — REST + GraphQL + WebSockets
│   ├── mobile/        React Native (Expo SDK 50) — iOS + Android
│   ├── web/           Next.js 14 (App Router) — marketing + SEO pet pages
│   └── admin/         Next.js 14 — moderation, analytics
├── packages/
│   └── shared/        Cross-app types, constants, theme, validators
├── infra/
│   ├── docker/        Dockerfiles + postgres init (PostGIS + pgvector)
│   ├── migrations/    Raw SQL (parity with Prisma — for ops review)
│   └── terraform/     AWS infra-as-code
├── docs/              Architecture, API, deployment, security
└── .github/workflows/ CI for monorepo + EAS for mobile
```

Workspace tool: **pnpm + Turbo**. Hot path: `pnpm dev` runs api + mobile + web + admin in parallel via Turbo.

---

## 4. Service Boundaries

| Domain | NestJS Module | Storage | External |
|---|---|---|---|
| Identity | `auth`, `users` | Postgres | Twilio Verify (OTP), Apple/Google OAuth |
| Pet identity | `pets` | Postgres + PostGIS + R2 | — |
| Discovery | `swipes`, `matches`, `feed` | Postgres + Redis cache | — |
| Communication | `chats`, ws gateway | Postgres + Redis (pub/sub) | — |
| Content | `posts`, `uploads` | Postgres + R2 | Mux (video) |
| AI surface | `ai/bio`, `ai/breed`, `ai/caption` | Postgres | Anthropic, Replicate |
| Safety | `moderation`, `reports` | Postgres | AWS Rekognition, Perspective |
| Money | `payments` | Postgres + Stripe webhook | Stripe, RevenueCat |
| Trust | `breeders` | Postgres | AKC/UKC registry APIs |
| Engagement | `notifications` | Postgres + BullMQ | FCM/APNs |

Each module exposes a **REST controller** (`/api/v1/*`) and where useful, a **WebSocket event surface** (`chat:*`, `match:new`, `notification:new`).

---

## 5. Data Architecture

### 5.1 Database — Postgres 16 with extensions
- `postgis` — geo radius queries (`ST_Distance`, `ST_DWithin`)
- `pgvector` — pet embeddings (384-d) for the recommendation tower
- `pg_trgm` — fuzzy search (breed names, pet names)

### 5.2 Core entities (21 Prisma models)
```
User · OAuthAccount · Pet · PetEmbedding · Breeder · Litter
Swipe · Match · Chat · Message
Post · PostLike · PostComment · Follow
Report · ModerationAction · Notification
SubscriptionPlan · Subscription · CoinTransaction · RecommendationLog
```

Full schema: `apps/api/prisma/schema.prisma`. Raw-SQL parity migration: `infra/migrations/`.

### 5.3 Hot data — Redis
- **Swipe stack cache** — pre-computed candidate IDs per user, 5min TTL
- **Chat session state** — typing indicators, presence
- **Rate limit counters** — per-route ThrottlerModule storage
- **Notification dedupe** — debounce push for same target within window

### 5.4 Cold data + analytics — BigQuery
- All write events emitted to Kafka → streamed to BigQuery
- Downstream: ML training, dashboards (Looker/Metabase), cohort analysis

### 5.5 Media — Cloudflare R2
- S3-compatible. Egress-free → cost-efficient at scale
- Presigned URL uploads from mobile client → direct to R2
- Mux for video transcoding + adaptive bitrate playback

---

## 6. Matching & Recommendation

Two phases live in `apps/api/src/modules/matches/`:

### 6.1 Compatibility Scoring (`compatibility.service.ts`)
Deterministic 0–100 score, 8 factors, weighted:

| Factor | Weight | Source |
|---|---|---|
| Distance | 25% | PostGIS ST_Distance |
| Breed fit | 15% | Exact match / mixed scoring table |
| Personality | 15% | Cosine similarity over 1–10 trait vectors |
| Size | 10% | Penalty matrix (toy ↔ giant unsafe) |
| Age | 10% | Decay over Δyears |
| Activity | 10% | Energy delta |
| Health | 10% | Vacc-status pairing rule |
| Owner overlap | 5% | Country + later: schedule overlap |

### 6.2 Recommendation Engine (`recommend.service.ts`)
- **Shortlist:** PostGIS radius query, filtered by mode (Friends / Breeding / Adoption / Lost) and already-swiped exclusion
- **Re-rank:** CompatibilityService over shortlist
- **Logging:** every served stack stored in `RecommendationLog` for ML training
- **Phase-2:** swap re-rank with two-tower model served via Pinecone embeddings (`PetEmbedding` table already has the column)

---

## 7. Real-Time Layer

- **Socket.io on NestJS** (`apps/api/src/ws/chat.gateway.ts`)
- **Auth at connect:** JWT verified against `JWT_ACCESS_SECRET`; reject otherwise
- **Rooms:**
  - `user:{id}` — direct delivery (matches, notifications)
  - `chat:{chatId}` — conversation broadcasts
- **Horizontal scale:** Redis adapter so events fan out across pods
- **Server-side emit helpers:** `emitMessage`, `emitMatch`, `emitNotification` — called by domain services on persist

---

## 8. AI Surface

### 8.1 Bio generation (`ai/services/bio.service.ts`)
- Anthropic Claude 3.5 Haiku, 200 tokens, structured prompt
- Dev fallback: deterministic template when no API key

### 8.2 Breed ID (`ai/services/breed.service.ts`)
- Replicate hosted vision model (fine-tuned on Stanford Dogs + iNaturalist)
- Stubbed for MVP; ship behind feature flag

### 8.3 Caption (`ai/services/caption.service.ts`)
- Claude on uploaded media metadata + pet context

### 8.4 Safety classifiers (`moderation/services/`)
- **toxicity.service.ts** — Perspective API on every outbound message
- **image.service.ts** — AWS Rekognition (NSFW, weapons) + custom animal-distress classifier
- Pre-publish gate; failing content goes to `Report` queue with status `OPEN`

---

## 9. Security

| Surface | Mechanism |
|---|---|
| **Auth** | JWT access (15min) + refresh (30d, rotated); HttpOnly cookies for web; SecureStore for mobile |
| **OTP** | Twilio Verify; rate-limit 5/hr/phone; IP-velocity check |
| **OAuth** | Apple, Google, Facebook — server-side token exchange |
| **Transport** | TLS 1.3 only; HSTS preload; cert pinning on mobile |
| **Storage** | At-rest AES-256 (Postgres + R2); secrets via Doppler |
| **Chat** | E2E-encrypted optional (Signal protocol via Stream/MLS); always TLS in transit |
| **Privacy** | Geo-jitter on home pings; "Hide my home"; right-to-be-forgotten (GDPR DELETE cascade) |
| **Abuse** | Behavioral ML on swipes (bot detect); device fingerprint; report-triage SLA 12h |
| **Animal welfare** | Custom Rekognition labels + immediate human review + ASPCA escalation |
| **PII** | ID verification via Persona/Veriff; never store raw documents — only verification tokens |
| **App security** | Mobile binary obfuscation, jailbreak detect (optional gate for breeding mode) |

---

## 10. Observability

| Concern | Tool |
|---|---|
| APM + traces | Datadog |
| Logs (structured JSON) | Datadog |
| Errors | Sentry (api + mobile + web) |
| Product analytics | PostHog |
| Real-user monitoring (web) | Cloudflare RUM |
| Alerting | PagerDuty + Datadog monitors |
| Health endpoint | `/health` returns DB + Redis + R2 |

---

## 11. Deployment

| Surface | Where | How |
|---|---|---|
| API | AWS ECS Fargate (→ EKS at scale) | Docker, rolling deploy via GitHub Actions |
| Web | Vercel (preview per PR) or AWS Amplify | Auto on `main` |
| Admin | Vercel (private, behind SSO) | Auto on `main` |
| Mobile | EAS Build → TestFlight + Play Internal | GitHub Actions workflow `eas-mobile.yml` |
| Postgres | RDS Aurora (PostGIS + pgvector via custom image) | Managed snapshots |
| Redis | ElastiCache | Cluster mode for chat pub/sub |
| R2 | Cloudflare | Lifecycle rules for cold media |
| DNS | Cloudflare | snifff.app + api.snifff.app + admin.snifff.app |

Multi-region: EU-West for GDPR users, AP-South for India. Latency-routed via Cloudflare load balancers.

---

## 12. Scaling Plan

| MAU | Architecture Change |
|---|---|
| 0–100K | Monolith on single ECS service, 2 tasks |
| 100K–1M | Read replicas on Postgres, Redis cluster, CDN aggressive caching |
| 1M–5M | Extract `feed` and `matches` into Go services (already designed boundary); Kafka for events |
| 5M–20M | EKS, sharded Postgres for `messages` (time partitioned), Pinecone for embeddings |
| 20M+ | Multi-region active-active, edge-side rendering for SEO pages, separate ML inference cluster |

---

## 13. Roadmap (mirrors `docs/ROADMAP.md`)

| Phase | Months | KPI |
|---|---|---|
| MVP | 0–6 | 25K downloads · 30% D7 |
| Expansion | 7–12 | 1M MAU · 5% paid · $2M ARR |
| Scale | 13–24 | 10M MAU · 7% paid · $50M ARR |
| Empire | 25–48 | 38M MAU · $250M+ ARR · IPO path |

---

## 14. Onboarding a New Engineer (Day 1)

```bash
git clone <repo>
cd snifff
pnpm install
cp .env.example .env                    # fill in secrets
docker compose up -d                    # postgres + redis + meilisearch
pnpm --filter @snifff/api prisma:migrate
pnpm --filter @snifff/api prisma:seed
pnpm dev                                # all 4 apps in parallel
```

- **API:** `http://localhost:3000`
- **Web:** `http://localhost:3001`
- **Admin:** `http://localhost:3002`
- **Mobile:** Expo dev server at `http://localhost:8081` — open in iOS Simulator or scan QR with Expo Go

Read next: `docs/API.md` for endpoint reference, `docs/DEPLOYMENT.md` for production runbook.
