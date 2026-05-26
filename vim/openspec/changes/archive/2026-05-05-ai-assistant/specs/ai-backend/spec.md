## ADDED Requirements

### Requirement: Chat API endpoint
The system SHALL expose a POST /api/chat endpoint that accepts messages and returns an SSE stream.

#### Scenario: Valid chat request
- **WHEN** a POST request is sent to /api/chat with a JSON body containing a messages array
- **THEN** the server responds with Content-Type: text/event-stream and streams the AI response chunks

### Requirement: OpenAI-compatible API forwarding
The system SHALL forward chat requests to an OpenAI-compatible API endpoint configured via environment variables (API_BASE_URL, API_KEY, MODEL_NAME).

#### Scenario: Request forwarding with default model
- **WHEN** a chat request arrives and MODEL_NAME is set to "glm-5"
- **THEN** the server sends a streaming request to API_BASE_URL/v1/chat/completions with model="glm-5" and the provided messages, using API_KEY for authentication

### Requirement: System prompt injection
The system SHALL prepend a system message instructing the AI to act as a Mermaid expert and format code in ```mermaid blocks.

#### Scenario: System prompt included
- **WHEN** any chat request is processed
- **THEN** a system prompt is prepended to the messages array before forwarding to the LLM API

### Requirement: CORS support
The system SHALL allow cross-origin requests from the frontend development server.

#### Scenario: Frontend makes request
- **WHEN** the frontend at localhost:5173 sends a request to the backend at localhost:3000
- **THEN** the backend responds with appropriate CORS headers allowing the request

### Requirement: Environment variable configuration
The system SHALL read API_BASE_URL, API_KEY, and MODEL_NAME from environment variables, with sensible defaults for GLM-5.

#### Scenario: Default configuration
- **WHEN** no environment variables are set
- **THEN** MODEL_NAME defaults to "glm-5", and API_BASE_URL and API_KEY MUST be provided (server logs warning if missing)

### Requirement: Rate limiting
The system SHALL limit chat requests per IP to prevent abuse (20 requests per minute by default).

#### Scenario: Rate limit exceeded
- **WHEN** an IP exceeds 20 requests per minute
- **THEN** the server responds with HTTP 429 Too Many Requests
