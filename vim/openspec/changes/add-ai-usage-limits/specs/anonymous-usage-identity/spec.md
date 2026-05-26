## ADDED Requirements

### Requirement: Anonymous usage identity cookie
The system SHALL issue an anonymous usage identity cookie for clients that do not have one.

#### Scenario: Anonymous client requests usage status
- **WHEN** an anonymous client requests usage status without an anonymous usage cookie
- **THEN** the server sets a new anonymous usage cookie and returns usage state for that identity

#### Scenario: Anonymous client calls HTTP AI endpoint
- **WHEN** an anonymous client calls an HTTP AI endpoint without an anonymous usage cookie
- **THEN** the server sets a new anonymous usage cookie when returning the HTTP response

#### Scenario: Existing anonymous cookie is reused
- **WHEN** an anonymous client sends a valid anonymous usage cookie
- **THEN** the server reuses that identity for usage attribution rather than issuing a new one

### Requirement: Anonymous identity cookie security
The anonymous usage cookie SHALL be configured as a server-side attribution signal rather than a JavaScript-readable authority.

#### Scenario: Cookie is set
- **WHEN** the server sets the anonymous usage cookie
- **THEN** the cookie is HTTP-only, SameSite=Lax, Path=/, and Secure when production cookie security is enabled

#### Scenario: Cookie value is persisted or compared
- **WHEN** the server persists or compares anonymous identity information
- **THEN** it uses a hashed representation of the cookie value rather than storing the plaintext value as the quota key

### Requirement: IP fallback attribution
The system SHALL derive a privacy-preserving IP attribution key for AI usage limits.

#### Scenario: Request IP is available
- **WHEN** the server handles an AI request with a detectable client IP
- **THEN** it derives a hashed IP key for quota evaluation and usage events

#### Scenario: Request IP is unavailable
- **WHEN** the server cannot detect a client IP
- **THEN** it uses a stable unknown-IP fallback key for quota evaluation

### Requirement: Identity precedence
The system SHALL prefer authenticated user identity over anonymous identity for primary quota attribution.

#### Scenario: Logged-in user has anonymous cookie
- **WHEN** an authenticated user sends an AI request with an anonymous usage cookie
- **THEN** the server counts primary usage against the authenticated user and treats anonymous identity as secondary context only

#### Scenario: Anonymous user later logs in
- **WHEN** an anonymous user with existing anonymous usage history logs in
- **THEN** future AI requests count against the authenticated user quota without automatically migrating prior anonymous counts

### Requirement: WebSocket anonymous fallback
The system SHALL handle WebSocket chat connections that do not yet have an anonymous usage cookie.

#### Scenario: WebSocket lacks anonymous cookie
- **WHEN** an anonymous `/ws/chat` connection has no anonymous usage cookie
- **THEN** the server applies IP fallback limits and does not fail the connection solely because the cookie is missing
