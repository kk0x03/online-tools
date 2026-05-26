## ADDED Requirements

### Requirement: Email verification code request
The system SHALL provide an endpoint for requesting an email login verification code without revealing whether the email already has an account.

#### Scenario: Valid email requests login code
- **WHEN** a client sends `POST /api/auth/email/start` with a syntactically valid email address
- **THEN** the server normalizes the email address, creates a short-lived verification code record, sends or logs the code, and returns a generic success response

#### Scenario: Existing account is not revealed
- **WHEN** a client requests a login code for any syntactically valid email address
- **THEN** the response body does not reveal whether a user record already exists for that email address

#### Scenario: Invalid email is rejected
- **WHEN** a client sends `POST /api/auth/email/start` with a missing or syntactically invalid email address
- **THEN** the server responds with a validation error and does not create a verification code

### Requirement: Verification code security controls
The system SHALL protect email verification codes from reuse, long-lived validity, and brute-force guessing.

#### Scenario: Code expires
- **WHEN** a client submits a verification code after its expiry time
- **THEN** the server rejects the verification request and does not create a session

#### Scenario: Code is consumed after successful use
- **WHEN** a client successfully verifies a code
- **THEN** the server marks that code as consumed so it cannot be used again

#### Scenario: Too many failed attempts
- **WHEN** a client exceeds the allowed failed attempts for a verification code
- **THEN** the server rejects further verification attempts for that code and does not create a session

#### Scenario: Repeated requests are rate limited
- **WHEN** an IP address or email address exceeds the configured verification-code request limit
- **THEN** the server rejects additional code requests with a rate-limit response

### Requirement: Email code verification and session creation
The system SHALL verify email login codes and issue an HTTP-only session cookie for successful verification.

#### Scenario: New email verifies successfully
- **WHEN** a client sends `POST /api/auth/email/verify` with a valid email and matching active code for an email without an existing user
- **THEN** the server creates a user record, creates a session record, sets an HTTP-only session cookie, and returns the authenticated user

#### Scenario: Existing email verifies successfully
- **WHEN** a client sends `POST /api/auth/email/verify` with a valid email and matching active code for an existing user
- **THEN** the server updates the user's last login time, creates a new session record, sets an HTTP-only session cookie, and returns the authenticated user

#### Scenario: Wrong code is rejected
- **WHEN** a client sends `POST /api/auth/email/verify` with an incorrect code
- **THEN** the server records a failed attempt, does not create a session, and returns an authentication error

### Requirement: Current user lookup
The system SHALL provide an endpoint for resolving the current authenticated user from the session cookie.

#### Scenario: Active session resolves user
- **WHEN** a client sends `GET /api/auth/me` with a valid unexpired session cookie
- **THEN** the server returns the authenticated user's public account fields

#### Scenario: Missing session returns anonymous state
- **WHEN** a client sends `GET /api/auth/me` without a session cookie
- **THEN** the server returns an anonymous state without creating a user or session

#### Scenario: Expired or revoked session returns anonymous state
- **WHEN** a client sends `GET /api/auth/me` with an expired or revoked session cookie
- **THEN** the server clears the stale cookie when possible and returns an anonymous state

### Requirement: Logout
The system SHALL allow users to revoke the current session and clear the session cookie.

#### Scenario: Authenticated user logs out
- **WHEN** a client sends `POST /api/auth/logout` with a valid session cookie
- **THEN** the server revokes that session, clears the session cookie, and returns success

#### Scenario: Anonymous logout is safe
- **WHEN** a client sends `POST /api/auth/logout` without a valid session cookie
- **THEN** the server clears any stale cookie and returns success

### Requirement: Auth persistence
The system SHALL persist users, verification codes, and sessions durably on the server.

#### Scenario: Server restarts after login
- **WHEN** the server restarts while a user's session is still unexpired and not revoked
- **THEN** `GET /api/auth/me` with that session cookie still resolves the authenticated user

#### Scenario: Sensitive tokens are not stored in plaintext
- **WHEN** verification codes and session tokens are written to persistence
- **THEN** the persisted records contain hashed values rather than the plaintext code or session token
