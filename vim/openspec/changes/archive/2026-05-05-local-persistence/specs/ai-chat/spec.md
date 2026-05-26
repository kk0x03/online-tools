## MODIFIED Requirements

### Requirement: Streaming AI response
The system SHALL display AI responses in real-time as they stream from the backend. Chat history SHALL persist to localStorage (capped at 20 messages) and restore on page reload.

#### Scenario: Chat history restored on page load
- **WHEN** user opens the page and localStorage contains saved chat messages
- **THEN** the chat panel displays the restored messages

#### Scenario: Chat saved after AI response completes
- **WHEN** an AI response stream ends (onDone) or encounters an error (onError)
- **THEN** the full conversation history is saved to localStorage, keeping only the most recent 20 messages

#### Scenario: No saved chat history
- **WHEN** user opens the page and localStorage has no chat messages
- **THEN** the chat panel shows the empty state message
