## 1. Server Dependencies and Configuration

- [x] 1.1 Add server dependencies for SQLite persistence, cookie parsing/serialization, and SMTP email delivery.
- [x] 1.2 Extend `server/.env.example` with `FRONTEND_ORIGIN`, `AUTH_DB_PATH`, `SESSION_SECRET`, session cookie settings, login-code expiry/attempt/rate-limit settings, and SMTP sender settings.
- [x] 1.3 Configure Express CORS for credentialed requests from the configured frontend origin.

## 2. Auth Data Layer

- [x] 2.1 Create a server database module that opens SQLite from `AUTH_DB_PATH` and initializes `users`, `email_login_codes`, and `sessions` tables.
- [x] 2.2 Implement email normalization, email validation, code generation, hashing, and constant-time hash comparison helpers.
- [x] 2.3 Implement session token generation, token hashing, session lookup, last-seen updates, expiry checks, and revocation helpers.
- [x] 2.4 Implement request throttling for login-code requests by normalized email and IP address.

## 3. Email Login API

- [x] 3.1 Add `POST /api/auth/email/start` with generic success responses, invalid-email validation, code creation, SMTP sending, and development console logging when SMTP is not configured.
- [x] 3.2 Add `POST /api/auth/email/verify` with code expiry checks, attempt limits, one-time consumption, user upsert, last-login update, and HTTP-only cookie setting.
- [x] 3.3 Add `GET /api/auth/me` that returns authenticated public user fields for an active session and anonymous state for missing, expired, or revoked sessions.
- [x] 3.4 Add `POST /api/auth/logout` that revokes the current session when present and clears the session cookie.
- [x] 3.5 Ensure verification codes and session tokens are never persisted in plaintext.

## 4. Chat Session Context

- [x] 4.1 Parse cookies during `/ws/chat` connection setup and resolve optional authenticated user context from the session table.
- [x] 4.2 Pass authenticated or anonymous user context to `handleChat` without changing the LLM prompt messages.
- [x] 4.3 Ensure missing, expired, revoked, or unknown session cookies do not prevent anonymous chat behavior.

## 5. Frontend Auth Utilities

- [x] 5.1 Add a frontend auth utility for `getCurrentUser`, `requestEmailCode`, `verifyEmailCode`, and `logout`, using `credentials: 'include'`.
- [x] 5.2 Add app-level auth state initialization from `GET /api/auth/me`, falling back to anonymous state on failure.
- [x] 5.3 Keep authenticated user state in memory only and avoid storing account identity in `localStorage`.

## 6. Frontend Account UI

- [x] 6.1 Add header account controls that show login when anonymous and user email plus logout when authenticated.
- [x] 6.2 Add an email login UI with email-entry, code-entry, loading, validation, and error states.
- [x] 6.3 Wire logout to clear server session state and return the header to anonymous state.
- [x] 6.4 Verify login and logout do not clear editor code, preview state, split preferences, or local chat history.

## 7. Verification

- [x] 7.1 Run the frontend production build.
- [x] 7.2 Run the server and verify email-code login locally using console-logged codes.
- [x] 7.3 Verify `GET /api/auth/me` survives a server restart while the SQLite session is still valid.
- [x] 7.4 Verify authenticated and anonymous `/ws/chat` connections both stream responses and do not add user email/id to LLM messages.
- [x] 7.5 Verify repeated login-code requests and repeated wrong verification attempts hit the expected limits.
