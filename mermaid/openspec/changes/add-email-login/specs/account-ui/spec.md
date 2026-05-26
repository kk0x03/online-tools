## ADDED Requirements

### Requirement: Auth state initialization
The frontend SHALL resolve the current authentication state when the app starts.

#### Scenario: App loads with active session
- **WHEN** the app loads and `GET /api/auth/me` returns an authenticated user
- **THEN** the header displays the user's email and a logout control

#### Scenario: App loads without active session
- **WHEN** the app loads and `GET /api/auth/me` returns anonymous state
- **THEN** the header displays a login control and the editor remains usable

#### Scenario: Auth lookup fails
- **WHEN** the app cannot complete the initial auth lookup due to a network or server error
- **THEN** the app keeps the editor usable and displays the anonymous account state

### Requirement: Email login UI
The frontend SHALL provide a login flow where users request an email verification code and submit it to authenticate.

#### Scenario: User requests verification code
- **WHEN** an anonymous user enters a valid email address and submits the login form
- **THEN** the frontend calls `POST /api/auth/email/start` with credentials enabled and advances to the code-entry step after success

#### Scenario: User verifies code
- **WHEN** a user enters a verification code for the requested email and submits it
- **THEN** the frontend calls `POST /api/auth/email/verify` with credentials enabled, stores the returned authenticated user in app state, and closes the login UI

#### Scenario: Verification fails
- **WHEN** code verification returns an authentication or validation error
- **THEN** the frontend keeps the login UI open and shows an error state without clearing the editor content

### Requirement: Logout UI
The frontend SHALL let authenticated users log out without deleting local editor state.

#### Scenario: User logs out
- **WHEN** an authenticated user clicks logout
- **THEN** the frontend calls `POST /api/auth/logout` with credentials enabled and returns the header to anonymous account state

#### Scenario: Local state remains after logout
- **WHEN** logout completes
- **THEN** the current editor code, preview state, UI split preferences, and locally stored chat history remain available

### Requirement: Anonymous editor preservation
The account UI SHALL NOT block existing local editor workflows.

#### Scenario: Anonymous user edits diagram
- **WHEN** a user is not logged in
- **THEN** they can still edit Mermaid code, preview diagrams, export diagrams, resize panels, and use local persistence

#### Scenario: Login does not auto-upload local data
- **WHEN** a user completes login
- **THEN** the frontend does not automatically upload local editor code or local chat history as part of this change
