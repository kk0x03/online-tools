## Why

The AI chat and autocomplete endpoints currently proxy requests to the model provider without usage enforcement. This exposes the server API key to cost abuse through repeated anonymous requests, especially because autocomplete can fire automatically while a user types.

## What Changes

- Add server-enforced AI usage limits for both `/ws/chat` and `POST /api/complete`.
- Identify usage by the strongest available key: authenticated user, anonymous device cookie, and hashed IP fallback.
- Issue and maintain an anonymous device identifier cookie for non-logged-in users.
- Persist daily/minute usage counters in SQLite so limits survive server restarts.
- Add short-window burst protection for IP/device/user keys.
- Add request-size validation for chat messages and autocomplete payloads before model calls.
- Return structured usage-limit errors and remaining quota metadata to the frontend.
- Add lightweight frontend display/handling for remaining usage and limit-exceeded states.

## Capabilities

### New Capabilities
- `ai-usage-limits`: Server-side quota, burst, and payload-size enforcement for chat and autocomplete model calls.
- `anonymous-usage-identity`: Anonymous device identity cookie used with hashed IP and authenticated user identity for usage attribution.
- `ai-usage-feedback`: Frontend handling and display of usage-limit state, remaining quota, and reset timing.

### Modified Capabilities
- None.

## Impact

- `server/index.js`: resolve anonymous/device/IP identity for HTTP and WebSocket AI requests.
- `server/routes/chat.js`: enforce limits before streaming chat requests and emit structured WebSocket usage-limit errors.
- `server/routes/complete.js`: enforce limits and payload validation before autocomplete model requests.
- `server/lib/*`: add usage identity, limiter, counters, and response metadata helpers.
- `server/.env.example`: add configurable quota, burst, payload-size, and anonymous-cookie settings.
- SQLite schema: add usage counter/event tables and anonymous identity storage as needed.
- `src/utils/chat.js`, `src/utils/complete.js`, `src/App.vue` or related components: surface limit errors and optional remaining quota state.
