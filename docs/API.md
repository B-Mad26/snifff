# Snifff API Reference

Base URL: `https://api.snifff.app/api/v1` (prod) · `http://localhost:3000/api/v1` (dev)

**Auth:** `Authorization: Bearer <access_token>` on every authenticated route.
**Versioning:** URI version (`/v1`) — breaking changes bump to `/v2`, never silently.
**Errors:** RFC 9457 problem+json — `{ "type", "title", "status", "detail" }`.
**Rate limits:** 120 req/min per user (default). Auth + upload routes have stricter buckets.

---

## Auth (`/auth`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/auth/otp/send` | `{ phone }` | Twilio Verify SMS |
| POST | `/auth/otp/verify` | `{ phone, code }` | Returns `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | `{ refreshToken }` | Rotates refresh token |
| POST | `/auth/oauth` | `{ provider, idToken }` | Apple / Google / Facebook |
| GET  | `/auth/me` | — | Current user (auth required) |

## Users (`/users`)

| Method | Path | Description |
|---|---|---|
| GET | `/users/me` | Self |
| PATCH | `/users/me` | Update profile (bio, name, avatar) |
| GET | `/users/:id` | Public user view |

## Pets (`/pets`)

| Method | Path | Description |
|---|---|---|
| GET    | `/pets`            | My pets |
| POST   | `/pets`            | Create pet (multipart or JSON+ uploaded media_id) |
| GET    | `/pets/nearby?lat=&lng=&radius_km=` | PostGIS radius search |
| GET    | `/pets/:id`        | Public pet view |
| PATCH  | `/pets/:id`        | Update (owner only) |
| DELETE | `/pets/:id`        | Soft delete |
| POST   | `/pets/:id/ai-bio` | Trigger Claude bio generation |

## Swipes (`/swipes`)

| Method | Path | Description |
|---|---|---|
| POST | `/swipes` | Body: `{ swiperPetId, targetPetId, action: SNIFF\|SUPER_SNIFF\|PASS, mode: FRIENDS\|BREEDING\|ADOPTION\|LOST\|PLAYDATE }`. Returns `{ matched: bool, match?: Match }` if both sides Sniffed. |

## Matches (`/matches`)

| Method | Path | Description |
|---|---|---|
| GET    | `/matches`                          | My active matches |
| GET    | `/matches/stack?petId=&mode=`       | Recommended candidate stack (PostGIS shortlist + Compatibility re-rank) |
| DELETE | `/matches/:id`                      | Unmatch |

## Chats (`/chats`) + WebSocket

| Method | Path | Description |
|---|---|---|
| GET  | `/chats`                  | My chats with last message preview |
| GET  | `/chats/:id/messages?cursor=` | Paginated messages |
| POST | `/chats/:id/messages`     | Send (also fans out via WS) |

**WebSocket** `wss://api.snifff.app/ws` — connect with `auth: { token }`:

```
emit  chat:join     { chatId }
emit  chat:typing   { chatId }
on    message:new   <Message>
on    match:new     <Match>
on    notification:new <Notification>
```

## Posts (`/posts`)

| Method | Path | Description |
|---|---|---|
| POST   | `/posts`              | Create photo/video/story/tail |
| GET    | `/posts/:id`          | Single post |
| DELETE | `/posts/:id`          | Delete (owner only) |
| POST   | `/posts/:id/like`     | Like |
| DELETE | `/posts/:id/like`     | Unlike |
| POST   | `/posts/:id/comments` | Comment (body: `{ body, parentId? }`) |
| GET    | `/posts/:id/comments` | Threaded comments |

## Feed (`/feed`)

| Method | Path | Description |
|---|---|---|
| GET | `/feed/tails?cursor=`    | Algorithmic vertical video feed |
| GET | `/feed/discover?cursor=` | Photo/story discovery |

## AI (`/ai`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/ai/bio`      | `{ petId }`      | Generate bio (Claude) |
| POST | `/ai/breed-id` | `{ imageUrl }`   | Breed classification (Replicate) |
| POST | `/ai/caption`  | `{ imageUrl }`   | Caption suggestion |

## Uploads (`/uploads`)

| Method | Path | Description |
|---|---|---|
| POST | `/uploads/sign` | Presigned R2 PUT URL `{ kind: image\|video, contentType }` |

## Notifications (`/notifications`)

| Method | Path | Description |
|---|---|---|
| GET | `/notifications`     | List (paginated, unread first) |
| POST | `/notifications/:id/read` | Mark read |

## Reports (`/reports`)

| Method | Path | Description |
|---|---|---|
| POST | `/reports` | `{ targetKind, targetId, reason, detail }` |

## Breeders (`/breeders`)

| Method | Path | Description |
|---|---|---|
| GET    | `/breeders`            | Verified breeders directory |
| GET    | `/breeders/:id`        | Public breeder page (SEO indexable on web) |
| POST   | `/breeders`            | Apply for verification |

## Payments (`/payments`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/payments/subscribe` | `{ planCode }` | Create Stripe checkout session |
| POST | `/payments/webhook`   | Stripe signed | Subscription state transitions |

## Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | DB + Redis + R2 ping |

---

## Pagination

Cursor-based: `?cursor=<opaque>&limit=20`. Response: `{ items, nextCursor }`.

## Idempotency

`Idempotency-Key` header on `POST /swipes`, `POST /payments/*`. Server stores result keyed by `(userId, key)` for 24h.
