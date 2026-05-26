## 1. Configuration and Schema

- [x] 1.1 Extend `server/.env.example` and config parsing with AI usage quota, burst, payload-size, and anonymous-cookie settings.
- [x] 1.2 Add SQLite schema initialization for `ai_usage_counters` and `ai_usage_events` with indexes for key/window lookup.
- [x] 1.3 Define default limits for anonymous, authenticated, and IP guardrail usage for both `chat` and `complete` features.

## 2. Usage Identity

- [x] 2.1 Implement usage identity helpers that derive `user:<id>`, `anon:<hash>`, and `ip:<hash>` keys from HTTP requests and WebSocket upgrade requests.
- [x] 2.2 Implement anonymous usage cookie creation, serialization, parsing, hashing, and production-safe cookie attributes.
- [x] 2.3 Add a `GET /api/usage/status` route that establishes anonymous identity when needed and returns current usage state.
- [x] 2.4 Ensure authenticated requests use user identity as primary attribution while retaining IP guardrail checks.

## 3. Limiter Core

- [x] 3.1 Implement payload validators for chat message count/content size and autocomplete code/cursor constraints.
- [x] 3.2 Implement fixed-window counter helpers for daily and minute windows.
- [x] 3.3 Implement transactional `checkAndConsumeUsage(feature, identity)` logic that evaluates all applicable keys and increments counters before provider calls.
- [x] 3.4 Implement structured usage metadata and usage-limit error objects for HTTP and WebSocket transports.
- [x] 3.5 Record usage events for allowed, limited, and invalid AI requests without storing plaintext IPs or anonymous cookie values.

## 4. Chat Enforcement

- [x] 4.1 Resolve usage identity during `/ws/chat` connection setup, including authenticated user, anonymous cookie, and IP hash.
- [x] 4.2 Validate chat payloads before quota consumption.
- [x] 4.3 Enforce chat daily and burst limits before calling the model provider.
- [x] 4.4 Send structured WebSocket usage-limit errors and successful usage metadata messages.
- [x] 4.5 Preserve existing stop/cancel behavior when a chat request is limited before provider forwarding.

## 5. Autocomplete Enforcement

- [x] 5.1 Resolve usage identity for `POST /api/complete`, setting anonymous cookie on HTTP responses when needed.
- [x] 5.2 Validate autocomplete payloads before quota consumption.
- [x] 5.3 Enforce autocomplete daily and burst limits before calling the model provider.
- [x] 5.4 Return HTTP 429 usage-limit errors and include usage metadata on successful completion responses.

## 6. Frontend Feedback

- [x] 6.1 Add a frontend usage API helper for `GET /api/usage/status` with credentialed requests.
- [x] 6.2 Load usage status on app startup to establish the anonymous usage cookie before WebSocket chat.
- [x] 6.3 Update `src/utils/complete.js` and editor completion handling to recognize usage-limit errors and avoid immediate repeated retries.
- [x] 6.4 Update `src/utils/chat.js` and `ChatPanel.vue` to handle structured usage-limit and usage metadata messages.
- [x] 6.5 Cache latest usage metadata as display-only local state and replace it when server status is refreshed.

## 7. Verification

- [ ] 7.1 Verify anonymous autocomplete and chat requests consume separate counters and return remaining quota metadata.
- [ ] 7.2 Verify authenticated requests count against user quota while IP burst guardrails still apply.
- [ ] 7.3 Verify clearing local storage does not reset server-side limits while the anonymous cookie/IP remain.
- [ ] 7.4 Verify missing anonymous cookie on WebSocket falls back to IP limits without breaking anonymous chat.
- [ ] 7.5 Verify oversized chat and autocomplete payloads are rejected before usage is consumed.
- [ ] 7.6 Verify daily counters survive server restart.
- [ ] 7.7 Run the frontend production build and server syntax checks.
