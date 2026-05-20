# Snifff — Security & Trust Model

> A pet social app is a pet *trust* app. This document is the source of truth for how we keep humans, pets, and the platform safe.

---

## 1. Threat Model

| Actor | Goal | Mitigation |
|---|---|---|
| Scammer / catfisher | Steal money or identity | ID verification, reverse-image search, money-keyword detection in chat |
| Fake breeder / puppy mill | Sell unethical pets | Registry cross-check, document verification, DNA lineage chain |
| Bot / scraper | Mass profile harvest | Rate limits, device fingerprint, behavioral ML, captcha on suspect signals |
| Animal abuser | Post harmful content | Custom Rekognition labels, immediate human review, ASPCA escalation |
| Predator targeting minors | Approach via chat | 18+ gate, breeding mode requires 21+ + ID, AI-moderated DMs |
| Insider | Exfiltrate user data | Least-privilege IAM, audit logs, encrypted PII columns |
| Account takeover | Phish/credential stuff | OTP + optional passkey, anomaly detection on login, device binding |

---

## 2. Authentication & Authorization

### Tokens
- **Access JWT** — RS256, 15min TTL, contains `sub`, `tier`, `roles[]`
- **Refresh** — opaque random 256-bit, stored hashed in `users.refresh_token_hash`; rotated on every use
- Apple/Google/Facebook OAuth tokens exchanged server-side for our JWT pair

### Web
- HttpOnly + Secure + SameSite=Lax cookies
- CSRF protection via double-submit token for state-changing routes

### Mobile
- SecureStore (Keychain on iOS / EncryptedSharedPreferences on Android)
- Certificate pinning to `api.snifff.app`

### Authorization
- Role-based: `user`, `breeder`, `moderator`, `admin`
- Resource-based guard for owner-only mutations (e.g., pet updates)
- Premium gating via subscription tier check (`@Throttle` decorators)

---

## 3. Data Privacy

### Location
- **Never** ship exact GPS to clients
- Server stores `GEOGRAPHY(POINT, 4326)` and returns only city + distance rounded to 0.1km
- "Hide my home" mode applies 200m random jitter on stored point

### PII columns (encrypted at rest with column-level keys)
- `users.phone`, `users.email`, `users.dob`
- `breeders.registry_number`
- ID-verification token (stored — raw document never persisted)

### GDPR / CCPA
- Right to be forgotten: cascade DELETE from `users` triggers anonymization of swipes/messages (PII stripped, IDs replaced with hash)
- Data export: signed S3 URL with full JSON dump within 30 days of request

### COPPA
- Hard age gate on signup (DOB required, < 13 blocked)
- Limited mode 13–17: no swipe, no chat, no breeding

---

## 4. Chat Security

- **TLS-in-transit** always
- **E2E option** for premium tiers via Stream Chat MLS (Phase 3)
- **Toxicity classifier** runs pre-send; messages above threshold prompt the sender ("This may be hurtful — send anyway?") with both choices logged
- **Money-keyword detection** triggers a warning + automatic report
- **Image attachments** scanned by Rekognition before delivery

---

## 5. Content Moderation Pipeline

```
upload → presigned URL → R2
              ↓
       AI gate (Rekognition + custom labels)
              ↓
  ┌───────────┴───────────┐
  ▼                       ▼
 PASS                  FLAG
 publish               quarantine + Report.OPEN
                       ▼
                       Mod queue (12h SLA)
                       ▼
              ┌────────┴────────┐
              ▼                 ▼
            allow             remove + actions
                              (warn/suspend/ban + escalate)
```

Actions logged to `ModerationAction` with reviewer ID, timestamp, AI score, and decision.

---

## 6. Breeder Verification (Phase 2)

Five tiers of trust:
1. **Unverified** — default, breeding-mode disabled
2. **Doc submitted** — kennel license + ID uploaded
3. **Doc verified** — moderator approval
4. **Registry cross-checked** — AKC/UKC API confirms registration
5. **Snifff Verified Breeder** — in-person video verification + DNA lineage chain

Each tier unlocks more visibility and trust badges.

---

## 7. Animal Welfare

- Custom image classifier flags signs of distress (injury, malnutrition, confinement)
- Flagged content + reporter info routed to in-house animal-welfare specialist
- Confirmed cases escalated to ASPCA (US) / RSPCA (UK) / local equivalents
- "Ethical Breeding Pledge" required for Breeding mode — violations result in permanent ban

---

## 8. Application Security

- **OWASP Top 10** explicit coverage in CI:
  - Snyk dependency scan
  - Semgrep SAST on every PR
  - DAST nightly against staging
- **Secrets scanning** with gitleaks on every push
- **CSP** enforced on web with nonces
- **Rate limits** per route bucket (`@Throttle`), tighter for auth (`5/15min`) and uploads (`30/hr`)
- **Idempotency keys** on `POST /swipes`, `POST /payments/*`
- **SQL** only via Prisma or parameterized raw — never string-concatenated

---

## 9. Audit Logging

Every state-changing admin action logs:
```
ModerationAction {
  reviewerId, targetKind, targetId, action,
  reason, aiScore?, timestamp, prevState, newState
}
```
Audit log retained 7 years (regulatory floor for some jurisdictions). Append-only — no UPDATE/DELETE on this table.

---

## 10. Disclosure Policy

`security@snifff.app` — PGP key at `https://snifff.app/.well-known/security.txt`.
90-day disclosure window for non-critical; immediate disclosure for in-flight exploitation.

Bug bounty (Phase 2): HackerOne private program, scope = all `*.snifff.app` + mobile binaries.
