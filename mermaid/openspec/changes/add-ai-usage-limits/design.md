## Context

The server currently exposes two model-consuming AI entry points:

- `POST /api/complete` for automatic editor line completion.
- `/ws/chat` for streaming chat generation.

Both endpoints use the server-side model API key and can be called anonymously. Email login already provides optional user identity, and SQLite already exists for auth persistence. This change adds usage enforcement without requiring login or introducing Redis.

## Goals / Non-Goals

**Goals:**
- Enforce AI request limits for both chat and autocomplete before calling the model provider.
- Attribute usage by authenticated user when available, anonymous device cookie when available, and hashed IP as a fallback/parallel guard.
- Persist counters so daily limits survive server restarts.
- Add short-window burst limits to reduce scripted abuse.
- Validate request payload sizes before model calls.
- Return structured usage-limit metadata to clients.
- Keep anonymous users able to use a small free allowance.

**Non-Goals:**
- Billing, paid plans, subscriptions, or payment provider integration.
- Precise token accounting from the model provider.
- Distributed multi-server rate limiting.
- Strong device fingerprinting.
- CAPTCHA or abuse scoring.
- Requiring login for AI features in this change.

## Decisions

### D1: Layered identity keys

Each AI request is evaluated against multiple keys:

```
authenticated session -> user:<userId>
anonymous cookie      -> anon:<anonIdHash>
network address       -> ip:<ipHash>
```

For authenticated users, `user:<id>` is the primary quota key, but IP burst limits still apply as a safety guard. For anonymous users, the anonymous cookie is the primary quota key when present, with IP limits as a fallback and shared-network guard.

Rationale: IP alone punishes shared networks and is easy to rotate; local/browser cache alone is trivial to clear; user identity alone does not cover anonymous traffic.

### D2: HTTP-only anonymous device cookie

Issue a random `mo_anon_id` cookie for anonymous clients through a new usage identity/status path and AI HTTP responses. The cookie is HTTP-only, SameSite=Lax, and Secure in production. The server stores and compares only a hash of the cookie value.

Rationale: the anonymous identifier is a server-side attribution signal, not a frontend credential. Keeping it HTTP-only prevents JavaScript from treating it as authority. The frontend can learn usage state through API responses instead.

WebSocket limitation: if a user opens `/ws/chat` without an existing anonymous cookie, the server cannot reliably set one during normal message flow. In that case the connection falls back to IP limits. The frontend should call a usage status endpoint on app load to establish the cookie before chat.

### D3: SQLite counters plus events

Use SQLite tables alongside auth data:

```
ai_usage_counters
  key, feature, window_type, window_start, count, updated_at

ai_usage_events
  id, user_id, anon_id_hash, ip_hash, feature, status, counted, created_at
```

Counters support enforcement. Events support debugging and later analytics. The limiter should increment counters transactionally before forwarding to the model so concurrent requests cannot all pass the same remaining quota check.

Rationale: the app is currently single-server and already uses SQLite. Redis can be added later if deployment becomes multi-node.

### D4: Fixed windows for first version

Use fixed windows:

- Daily quota windows start at UTC midnight.
- Burst windows use minute-level buckets.

Rationale: fixed windows are easy to reason about, easy to present in UI, and simple to implement in SQLite. Sliding windows are more precise but not needed for first deployment.

### D5: Separate feature limits

Treat chat and completion as separate features because their request patterns differ.

Suggested defaults:

```
Anonymous:
  chat:      10/day by anon, 20/day by IP, 5/minute burst by IP
  complete: 100/day by anon, 200/day by IP, 20/minute burst by IP

Authenticated:
  chat:      30/day by user, 10/minute burst by user, 5/minute burst by IP
  complete: 300/day by user, 40/minute burst by user, 20/minute burst by IP
```

All values should be configurable via environment variables.

### D6: Payload limits before quota consumption

Reject malformed or oversized requests before consuming usage.

Minimum validation:

- Chat messages MUST be an array.
- Chat message count MUST be capped.
- Total chat content characters MUST be capped.
- Autocomplete `code` length MUST be capped.
- Autocomplete `cursorLine` MUST be an integer within the code line range.

Rationale: payload validation prevents memory/token abuse and avoids charging users for requests that are never eligible for model forwarding.

### D7: Structured limit errors and metadata

When blocked, HTTP endpoints return `429` with:

```
{
  "error": "USAGE_LIMIT_EXCEEDED",
  "feature": "chat" | "complete",
  "limit": 10,
  "remaining": 0,
  "resetAt": "..."
}
```

WebSocket chat sends:

```
{ "type": "error", "code": "USAGE_LIMIT_EXCEEDED", ... }
```

Successful AI responses should include remaining quota where practical:

- HTTP completion: include `usage` in JSON response.
- WebSocket chat: send a `usage` message before or after stream completion.

### D8: Frontend cache is display-only

The frontend may cache latest usage metadata in `localStorage` for display continuity, but the server is the only authority. Clearing browser storage must not reset server-side quotas unless the anonymous cookie is also absent and IP fallback still applies.

## Risks / Trade-offs

- Shared IPs may hit IP limits together -> Use IP limits as guardrails and keep per-anon/per-user limits as primary.
- Users can clear cookies to reset anon quota -> IP fallback still limits repeated abuse; stronger controls can be added later.
- SQLite write contention under high traffic -> Accept for current single-server scope; use short transactions and indexes.
- Counting before upstream model failure may charge failed attempts -> Record event status; first version prioritizes abuse prevention over perfect refund semantics.
- WebSocket cannot always issue anonymous cookie -> Establish identity through app-load usage status request and fall back to IP for missing cookies.

## Migration Plan

1. Add usage-related SQLite tables during server startup.
2. Add usage identity helpers and anonymous cookie configuration.
3. Add limiter checks to `/api/complete` and `/ws/chat`.
4. Add frontend handling for usage status and structured limit errors.
5. Rollback by disabling limiter enforcement through configuration while leaving tables unused.

## Open Questions

- Should chat and autocomplete share a combined daily "AI units" quota in addition to per-feature quotas?
- Should authenticated users receive higher free limits immediately, or should this wait for account settings?
- Should limit reset use UTC midnight or the user's local timezone later?
