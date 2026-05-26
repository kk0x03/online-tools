## ADDED Requirements

### Requirement: Optional chat session resolution
The server SHALL resolve authenticated user context for WebSocket chat connections when a valid session cookie is present.

#### Scenario: Chat WebSocket connects with active session
- **WHEN** a client opens `/ws/chat` with a valid unexpired session cookie
- **THEN** the server associates that WebSocket connection with the authenticated user's id and email for server-side handling

#### Scenario: Chat WebSocket connects without session
- **WHEN** a client opens `/ws/chat` without a valid session cookie
- **THEN** the server treats the connection as anonymous and preserves the existing chat behavior

#### Scenario: Chat WebSocket connects with stale session
- **WHEN** a client opens `/ws/chat` with an expired, revoked, or unknown session cookie
- **THEN** the server treats the connection as anonymous and does not fail the connection solely because of the stale session

### Requirement: Chat identity privacy
The server SHALL NOT inject authenticated account identifiers into the LLM conversation payload.

#### Scenario: Authenticated user sends chat message
- **WHEN** an authenticated user sends a chat message over `/ws/chat`
- **THEN** the server forwards the same system prompt and user-provided messages to the LLM API without adding the user's email or user id to the prompt messages

### Requirement: Chat user context availability
The chat handler SHALL receive optional user context for future server-side policy decisions.

#### Scenario: Authenticated context is available to handler
- **WHEN** `handleChat` processes a message from a WebSocket associated with an authenticated user
- **THEN** the handler can access that user's id and email through an explicit user context parameter or connection property

#### Scenario: Anonymous context is represented consistently
- **WHEN** `handleChat` processes a message from an anonymous WebSocket
- **THEN** the handler receives a null or equivalent anonymous user context
