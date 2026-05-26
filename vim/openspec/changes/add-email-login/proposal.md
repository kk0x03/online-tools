## Why

The app currently has no account identity: editor state and chat history live only in browser `localStorage`, while the server cannot distinguish users for future sync, quota, or account-level settings. Email login provides a low-friction first account layer without introducing passwords or third-party OAuth dependencies.

## What Changes

- Add email verification-code login with request-code, verify-code, current-user, and logout API endpoints.
- Add durable server-side user and session storage so the backend can identify authenticated requests.
- Add frontend auth state, login/logout UI, and credential-aware API/WebSocket calls.
- Preserve the existing anonymous editor flow: users can continue editing, previewing, exporting, and using local persistence without logging in.
- Attach authenticated user context to AI chat sessions when a valid session exists, without changing the chat prompt behavior in this change.
- Add local-development email behavior that logs verification codes when SMTP is not configured.

## Capabilities

### New Capabilities
- `email-auth`: Email verification-code login, session issuance, session lookup, and logout.
- `account-ui`: Frontend login/logout controls and authenticated user state handling.
- `authenticated-chat-context`: Server-side association of AI chat WebSocket connections with the authenticated user when present.

### Modified Capabilities
- None.

## Impact

- `server/index.js`: add auth routes, credential-aware CORS, cookie parsing, and WebSocket session lookup.
- `server/routes/*`: add auth endpoints and update chat handling to receive authenticated user context.
- `server/package.json`: add dependencies for cookies, signed/session helpers as needed, SQLite persistence, and SMTP email delivery.
- `src/App.vue`: render account controls and initialize auth state.
- `src/utils/*`: add auth API helpers and update chat connection behavior where credentials/session state are relevant.
- New server data layer for users, login codes, and sessions.
- New environment variables for session secret, frontend origin, SQLite database path, SMTP configuration, and email sender identity.
