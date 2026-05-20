# Snifff — UX Flows & Screen Map

## Navigation Tree

```
RootNavigator
├── Auth Stack (unauthenticated)
│   ├── Onboarding (welcome carousel)
│   ├── PhoneSignIn
│   └── Otp
│
└── App Stack (authenticated)
    ├── TabNavigator
    │   ├── Sniff           (swipe stack)
    │   ├── Tails           (vertical video feed)
    │   ├── Post            (camera + composer)
    │   ├── Chats           (matches + DMs)
    │   └── Me              (profile + settings + pets)
    │
    ├── Modal: Match        (after a mutual sniff)
    ├── Modal: Chat         (entered from Chats or Match)
    ├── Stack: AddPet       (multi-step pet creation)
    ├── Stack: PetDetail    (other pet's profile)
    ├── Stack: PostDetail
    ├── Stack: Settings → Subscription → BreederVerification
    └── Stack: AdoptionDetail · LostPetDetail
```

---

## 1. Onboarding (10 steps, ~90 seconds)

1. **Welcome** — paw-print Lottie animation, tagline "Find your pup's people."
2. **Phone signup** — Twilio OTP. Apple/Google buttons inline.
3. **Your name + avatar** — quick human identity (we de-emphasize humans throughout; they only appear here once).
4. **First pet — photo** — opens camera. AI breed-ID runs in background.
5. **Pet details** — name, species, breed (pre-filled from AI), DOB, gender, size.
6. **Personality quiz** — 5 fun questions, output is a 16-type "Pet-Type" code (Myers-Briggs for pets).
7. **Vaccination upload** (optional) — unlocks Verified Health badge.
8. **Modes** — multi-select: Friends · Breeding · Adoption · Playdate · Lost & Found.
9. **Location permission** — framed as "Find pups in your neighborhood".
10. **Notification permission** — framed around match alerts.

End: confetti animation → 3 AI-recommended pets shown in the Sniff stack immediately.

---

## 2. Sniff (the addictive loop)

States:
- **Empty** — "Add your first pet" CTA
- **Out of cards** — "You're all caught up. Come back soon."
- **Active stack** — full-bleed pet card with compatibility ring (top right), pet name + distance + breed overlay (bottom), three action buttons (Pass / Super Sniff / Sniff)

Gestures (`react-native-reanimated 3` + `react-native-gesture-handler`):
- Horizontal pan rotates card up to 15°
- Threshold 30% of screen width triggers fly-out
- Vertical-up pan triggers Super Sniff
- Tap on card → expanded profile (bio, more photos, badges)
- Long-press anywhere → quick mode toggle

Feedback:
- Haptics on swipe (`Haptics.impactAsync`)
- Match → modal with paw-burst confetti + AI-generated "Pup Pickup Line"

---

## 3. Match Modal

Triggered server-side from `POST /swipes` returning `{ matched: true, match }`.

Hero:
- Two pet photos slide in from edges, collide center
- Coral confetti
- "It's a match!" title

Body:
- AI pickup line shown as suggestion (1-tap fill)
- Compatibility score shown as big number
- Both pet names + breed

CTA:
- "Send a message" → Chat
- "Keep sniffing" → back to stack

---

## 4. Chat

- Top bar: both pet avatars side-by-side + names; tap → joint profile
- Bubbles: coral (me) / grey (them), rounded 18px
- Inputs: text · voice note button · photo · sticker pack
- Bumble-style 24h timer for initiator-side matches (visible at top)
- AI safety filter intercepts before send

WebSocket events:
- `chat:join` on screen mount
- `chat:typing` while typing (debounced 500ms)
- Listen for `message:new`

---

## 5. Tails (video feed)

TikTok-style vertical scroll:
- Full-bleed pet video, autoplay-muted by default
- Right rail: paw-heart like, comment, share, follow pet
- Bottom: pet name handle, caption, audio attribution
- Algorithmic — `/feed/tails?cursor=` returns ranked items

Empty state: illustrated sleeping puppy with zzz's.

---

## 6. Post Composer

Center tab → bottom sheet:
- Photo · Story · Tail (video) · Live Bark
- AI Caption suggestion appears after media selected
- Mode selector: Public / Friends-only / Pack-only
- Pet selector (multi-pet accounts)

---

## 7. Chats

- Top: search bar + matches strip (horizontal scroll of new matches without yet a message)
- List: chats sorted by last-message timestamp
- Per row: pet avatar pair, last message preview, unread badge
- Long-press: archive / report / unmatch

---

## 8. Me

- Hero: human avatar + name + verified badge (if any)
- Carousel of my pets — tap to switch active
- Tiles: Stats (matches, posts, followers), Snifff+ upgrade, Settings, Help

Settings sub-pages:
- Privacy (Incognito, Hide my home, Block list)
- Notifications
- Subscription (Stripe portal link)
- Breeder Verification (if applicable)
- About / Help / Legal
- Log out

---

## 9. Adoption Mode (alternate stack)

- Same Sniff UI but cards show shelter info, adoption fee, "House requirements"
- Match flow shifts: "Sniff" → triggers shelter adoption-application form
- Successful adoption → auto-generates a Snifff Story (with shelter's permission)

---

## 10. Lost Pet Mode

- Geo-emergency: any user can post a lost-pet alert
- Broadcast push to all users within 10km radius
- Active alerts appear as a sticky banner on the Sniff stack
- "I've seen them" button → opens secure chat with owner + dropped pin

---

## Design Language

- **Coral** primary, **Ink** text, **Cream** background — see `packages/shared/src/theme.ts`
- **Fraunces** for headlines, **Inter** for body — Google Fonts loaded via Expo
- 16px corner radius default · 24px for hero cards
- Spring physics on every transition (`stiffness 200, damping 20`)
- Lottie for tail-wag loaders and match-burst animations
- Haptics on every state-changing tap

---

## Accessibility

- All interactive surfaces meet WCAG AA contrast
- VoiceOver / TalkBack labels on every actionable element
- Reduced-motion mode disables spring animations
- Pinch-to-zoom on every photo
- Caption auto-generation for posts (Whisper) — accessibility AND virality
