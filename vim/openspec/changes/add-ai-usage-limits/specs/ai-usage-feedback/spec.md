## ADDED Requirements

### Requirement: Usage status endpoint
The system SHALL expose an endpoint that returns current AI usage state for the requesting client.

#### Scenario: Client requests usage status
- **WHEN** a client sends `GET /api/usage/status`
- **THEN** the server returns usage information for chat and autocomplete, including limit, remaining, and reset time where available

#### Scenario: Status request establishes anonymous identity
- **WHEN** an anonymous client requests `GET /api/usage/status` without an anonymous usage cookie
- **THEN** the server sets an anonymous usage cookie and returns status for the new anonymous identity

### Requirement: Successful AI responses include usage metadata
The system SHALL provide usage metadata after successful AI requests where transport allows it.

#### Scenario: Autocomplete succeeds
- **WHEN** `POST /api/complete` succeeds
- **THEN** the response includes the completion text and usage metadata for the autocomplete feature

#### Scenario: Chat succeeds
- **WHEN** a `/ws/chat` request is accepted and completes or starts streaming
- **THEN** the server sends a WebSocket usage message containing remaining quota information for the chat feature

### Requirement: Frontend handles limit-exceeded states
The frontend SHALL present AI usage-limit failures without treating them as generic network failures.

#### Scenario: Autocomplete limit is exceeded
- **WHEN** `POST /api/complete` returns a usage-limit error
- **THEN** the editor suppresses the ghost-text suggestion and does not repeatedly retry the same limited request immediately

#### Scenario: Chat limit is exceeded
- **WHEN** `/ws/chat` sends a usage-limit error
- **THEN** the chat panel displays a clear limit-exceeded message with reset timing when provided

### Requirement: Frontend displays remaining usage
The frontend SHALL expose lightweight AI usage state to users when metadata is available.

#### Scenario: Usage metadata is received
- **WHEN** the frontend receives usage metadata from status, autocomplete, or chat responses
- **THEN** it updates the displayed or cached usage state for the relevant AI feature

#### Scenario: Cached usage metadata exists
- **WHEN** the app reloads with cached usage metadata in local storage
- **THEN** the frontend may display it as a stale hint until fresh server usage status is loaded

#### Scenario: Cached usage metadata is stale
- **WHEN** server usage status differs from cached usage metadata
- **THEN** the frontend treats the server response as authoritative and replaces the cached state
