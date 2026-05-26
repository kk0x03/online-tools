## ADDED Requirements

### Requirement: AI calls are quota checked before provider requests
The system SHALL check AI usage limits before forwarding chat or autocomplete requests to the model provider.

#### Scenario: Chat request within quota
- **WHEN** a client sends a valid chat message over `/ws/chat` and all applicable usage keys are within quota
- **THEN** the server increments the relevant usage counters and forwards the request to the model provider

#### Scenario: Autocomplete request within quota
- **WHEN** a client sends a valid `POST /api/complete` request and all applicable usage keys are within quota
- **THEN** the server increments the relevant usage counters and forwards the request to the model provider

#### Scenario: Request exceeds quota
- **WHEN** a chat or autocomplete request would exceed any applicable usage limit
- **THEN** the server does not call the model provider and returns a structured usage-limit error

### Requirement: Layered quota keys
The system SHALL evaluate usage against authenticated user, anonymous device, and hashed IP keys as applicable.

#### Scenario: Authenticated request
- **WHEN** an AI request includes a valid authenticated session
- **THEN** the server evaluates user-level limits and IP guardrail limits for that request

#### Scenario: Anonymous request with device cookie
- **WHEN** an AI request has no authenticated session but includes a valid anonymous usage cookie
- **THEN** the server evaluates anonymous-device limits and IP guardrail limits for that request

#### Scenario: Anonymous request without device cookie
- **WHEN** an AI request has no authenticated session and no valid anonymous usage cookie
- **THEN** the server evaluates IP fallback limits for that request

### Requirement: Separate feature limits
The system SHALL maintain separate limits for chat and autocomplete usage.

#### Scenario: Chat usage does not consume autocomplete quota
- **WHEN** a chat request is allowed and counted
- **THEN** the server increments chat counters without incrementing autocomplete counters

#### Scenario: Autocomplete usage does not consume chat quota
- **WHEN** an autocomplete request is allowed and counted
- **THEN** the server increments autocomplete counters without incrementing chat counters

### Requirement: Daily and burst windows
The system SHALL enforce both daily quota windows and short-window burst limits.

#### Scenario: Daily quota exceeded
- **WHEN** a usage key has reached its daily limit for a feature
- **THEN** additional requests for that feature are rejected until the daily window resets

#### Scenario: Burst limit exceeded
- **WHEN** a usage key exceeds the configured minute-level burst limit for a feature
- **THEN** additional requests for that feature are rejected until the burst window resets

### Requirement: Persistent usage counters
The system SHALL persist usage counters so quota state survives server restarts.

#### Scenario: Server restarts after usage
- **WHEN** a client consumes AI usage and the server restarts before the quota window resets
- **THEN** subsequent requests continue from the persisted usage count rather than resetting to zero

### Requirement: Payload validation before usage consumption
The system SHALL validate AI request payload sizes and shapes before consuming usage quota.

#### Scenario: Oversized chat payload
- **WHEN** a chat request exceeds the configured message count or total content character limit
- **THEN** the server rejects the request before incrementing usage counters and before calling the model provider

#### Scenario: Oversized autocomplete payload
- **WHEN** an autocomplete request exceeds the configured code length limit
- **THEN** the server rejects the request before incrementing usage counters and before calling the model provider

#### Scenario: Invalid autocomplete cursor
- **WHEN** an autocomplete request contains a cursor line that is missing, non-integer, or outside the submitted code line range
- **THEN** the server rejects the request before incrementing usage counters and before calling the model provider

### Requirement: Structured usage-limit errors
The system SHALL return machine-readable usage-limit errors when quota blocks an AI request.

#### Scenario: HTTP autocomplete is limited
- **WHEN** `POST /api/complete` is rejected due to usage limits
- **THEN** the server responds with HTTP 429 and a JSON body containing `error`, `feature`, `limit`, `remaining`, and `resetAt`

#### Scenario: WebSocket chat is limited
- **WHEN** a `/ws/chat` chat message is rejected due to usage limits
- **THEN** the server sends a WebSocket error message containing `type`, `code`, `feature`, `limit`, `remaining`, and `resetAt`
