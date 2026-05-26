## ADDED Requirements

### Requirement: Chat panel in editor area
The system SHALL display an AI chat panel below the code editor, occupying 40% of the editor area height by default, with the editor taking 60%.

#### Scenario: Default layout with chat panel
- **WHEN** the page loads
- **THEN** the editor area is split into editor (top 60%) and chat panel (bottom 40%), both within the left side of the split pane

#### Scenario: Chat panel collapsed
- **WHEN** user clicks the collapse button on the chat panel
- **THEN** the chat panel hides and the editor expands to fill 100% of the editor area height

#### Scenario: Chat panel expanded
- **WHEN** user clicks the expand button while chat panel is collapsed
- **THEN** the chat panel reappears at 40% height and editor shrinks to 60%

### Requirement: Chat input and message sending
The system SHALL provide a text input at the bottom of the chat panel where users can type natural language descriptions and send messages.

#### Scenario: Send a message
- **WHEN** user types text in the input and presses Enter or clicks the send button
- **THEN** the message appears in the chat as a user message bubble, the input is cleared, and an AI request is sent

#### Scenario: Empty message prevention
- **WHEN** user attempts to send with empty input
- **THEN** no message is sent and no request is made

### Requirement: Streaming AI response
The system SHALL display AI responses in real-time as they stream from the backend, showing text incrementally.

#### Scenario: AI response streams in
- **WHEN** the AI response begins streaming
- **THEN** text appears incrementally in an AI message bubble, with a loading indicator while streaming

#### Scenario: Stream completes
- **WHEN** the AI response stream ends
- **THEN** the loading indicator disappears and the full response is displayed

### Requirement: Code block detection with adopt/discard
The system SHALL detect mermaid code blocks (```mermaid ... ```) in AI responses and display "Adopt" and "Discard" buttons below each code block.

#### Scenario: AI response contains code block
- **WHEN** an AI response contains a ```mermaid code block
- **THEN** the code block is rendered with syntax highlighting and "Adopt" / "Discard" buttons appear below it

#### Scenario: User adopts code
- **WHEN** user clicks "Adopt" on a code block
- **THEN** the editor content is replaced with the code from that block, and the preview updates accordingly. The adopt/discard buttons are replaced with an "Adopted" label.

#### Scenario: User discards code
- **WHEN** user clicks "Discard" on a code block
- **THEN** the adopt/discard buttons disappear and the code block remains in the chat as reference only

### Requirement: Multi-turn conversation with editor context
The system SHALL maintain a conversation history and include the current editor code as context with each user message.

#### Scenario: Context sent with message
- **WHEN** user sends a message
- **THEN** the current editor code is included as context in the API request along with the full conversation history

### Requirement: Conversation error handling
The system SHALL display an error message in the chat panel when the AI request fails.

#### Scenario: API request fails
- **WHEN** the AI request returns an error or network failure
- **THEN** an error message is displayed in the chat panel as an AI message
