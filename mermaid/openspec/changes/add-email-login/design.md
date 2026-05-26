## Context

The app is currently a lightweight Vue 3 + Vite frontend with an Express/WebSocket backend used only as an AI proxy. Editor code, UI preferences, and recent chat history are stored in browser `localStorage`; the backend has no users, database, cookies, or per-user request context.

Email login is the first account layer. It needs to be secure enough for real users while staying small enough for the existing codebase: no passwords, no OAuth provider setup, no team/account billing model, and no mandatory login wall for the editor.

## Goals / Non-Goals

**Goals:**
- Let users authenticate with an email verification code.
- Store users and sessions durably on the server.
- Use an HTTP-only session cookie so the frontend never stores bearer tokens.
- Let the frontend show anonymous vs authenticated state and support logout.
- Preserve existing anonymous local editor behavior.
- Make authenticated user context available to the chat backend when a session exists.
- Support local development without SMTP by logging verification codes to the server console.

**Non-Goals:**
- Password login, password reset, OAuth, passkeys, or multi-factor authentication.
- Cloud diagram storage, cross-device document sync, sharing, teams, or billing.
- Uploading existing `localStorage` editor/chat data during login.
- Requiring login before editing, previewing, exporting, or using the current local persistence.
- Adding AI quota enforcement in this change.

## Decisions

### D1: Email verification code instead of password or OAuth

Use a short-lived 6-digit email verification code:

```
POST /api/auth/email/start   -> send code
POST /api/auth/email/verify  -> verify code, create session cookie
GET  /api/auth/me            -> current user or null
POST /api/auth/logout        -> revoke session and clear cookie
```

Rationale: this avoids password storage and reset flows while keeping provider dependencies limited to SMTP. OAuth is useful later, but it adds provider setup and account-linking complexity before the product has cloud account features.

### D2: Opaque server-side sessions in HTTP-only cookies

The browser receives a random session token in an HTTP-only cookie such as `mo_session`. The database stores only a hash of the token, with user id and expiry metadata.

Rationale: an opaque session can be revoked immediately, works naturally with browser WebSocket cookies, and keeps auth state out of JavaScript-accessible storage. JWTs would avoid a session lookup, but revocation and rotation are worse for this small app.

Cookie attributes:
- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production
- `Path=/`
- expiry aligned to the server session expiry

### D3: SQLite-backed auth persistence

Add a small server data layer backed by SQLite. Minimum tables:

```
users
  id, email unique, created_at, last_login_at

email_login_codes
  id, email, code_hash, expires_at, attempts, consumed_at, created_at, request_ip

sessions
  id, user_id, token_hash unique, expires_at, created_at, last_seen_at, revoked_at
```

Rationale: SQLite keeps deployment and local development simple while providing durable records and uniqueness constraints. The current server is single-process and low-traffic, so a dedicated Postgres service is unnecessary for the first account layer.

### D4: Hash verification codes and session tokens

Login codes and session tokens MUST NOT be stored in plaintext. Use Node `crypto` to hash codes and tokens with a server secret, compare hashes with constant-time comparison where practical, and mark codes consumed after successful verification.

Rationale: a database leak should not immediately expose active sessions or usable login codes.

### D5: Generic responses and rate limits

`/api/auth/email/start` returns a generic success response whether or not the email already belongs to a user. The server rate-limits code requests by IP and normalized email, limits verification attempts per code, and expires codes after a short window such as 10 minutes.

Rationale: this reduces account enumeration and brute-force risk. The exact limits can be configurable, but the initial defaults should be conservative enough for public use.

### D6: Credential-aware CORS

The server should replace permissive CORS with configured credential-aware CORS, defaulting in development to `http://localhost:5173`.

Rationale: auth endpoints need cookies, and cookie-bearing cross-origin requests must be constrained to expected frontend origins.

### D7: Auth state lives in a frontend utility, not global storage

Add a small `src/utils/auth.js` helper for `getCurrentUser`, `requestEmailCode`, `verifyEmailCode`, and `logout`. Components call it with `credentials: 'include'`. The logged-in user may be held in Vue state in `App.vue` or a small composable; it is not persisted in `localStorage`.

Rationale: `/api/auth/me` is the source of truth. Avoiding local persistence prevents stale or spoofed account display.

### D8: Chat receives user context but does not leak identity to the model

On `/ws/chat`, parse cookies during connection, resolve the session, and attach user context to the WebSocket object or pass it to `handleChat`. The chat request forwarded to the LLM remains the same except for existing system/user messages; user email/id are not injected into the prompt.

Rationale: this enables future per-user limits and audit logs without changing AI behavior or exposing user identifiers to the model provider.

## Risks / Trade-offs

- Email deliverability issues -> Support SMTP env configuration and log codes in development when SMTP is absent.
- Code brute force -> Expire codes quickly, cap attempts, hash codes, and rate-limit by email and IP.
- Session theft -> Use HTTP-only cookies, long random tokens, hashed DB storage, production `Secure`, and server-side revocation.
- CORS/cookie issues in development -> Document `FRONTEND_ORIGIN`, cookie secure behavior, and use `credentials: 'include'` in auth requests.
- SQLite concurrency limits -> Accept for first account layer; keep data access isolated so Postgres can replace it later if needed.
- Anonymous/local data confusion -> Do not auto-upload local editor or chat data; keep login purely about identity in this change.

## Migration Plan

1. Add the database initialization path and create auth tables on server start if absent.
2. Deploy auth endpoints while preserving anonymous editor and chat behavior.
3. Add frontend account UI and auth state initialization.
4. Update WebSocket connection handling to resolve optional session context.
5. Rollback by disabling account UI and leaving auth tables unused; existing local editor behavior remains unchanged.

## Open Questions

- Should production use numeric codes only, magic links only, or support both later?
- What exact rate limit defaults should be used for public deployment?
- Should AI chat become login-required once quota or billing exists?
