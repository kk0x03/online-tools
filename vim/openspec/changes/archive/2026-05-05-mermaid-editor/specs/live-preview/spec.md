## ADDED Requirements

### Requirement: Real-time Mermaid rendering
The system SHALL render the Mermaid diagram in the right panel in real-time as the user edits code, with a 300ms debounce to avoid excessive re-renders.

#### Scenario: Valid Mermaid code renders diagram
- **WHEN** user enters valid Mermaid code and 300ms has elapsed since the last keystroke
- **THEN** the corresponding diagram is rendered in the preview panel, replacing any previous content

#### Scenario: Empty editor shows empty preview
- **WHEN** the editor content is empty
- **THEN** the preview panel displays an empty state message (e.g., "Enter Mermaid code to preview")

### Requirement: Graceful error handling
The system SHALL display a friendly error message in the preview panel when the Mermaid code contains syntax errors, without crashing the page.

#### Scenario: Invalid Mermaid syntax
- **WHEN** user enters Mermaid code with syntax errors
- **THEN** the preview panel displays a clear error message indicating the issue, and the previous successful render (if any) remains visible or is replaced by the error state

### Requirement: Mermaid lazy loading
The system SHALL load the Mermaid library via dynamic import on first render, not blocking the initial page load.

#### Scenario: First page load performance
- **WHEN** user opens the page
- **THEN** the page shell (header, toolbar, editor, preview panel) renders immediately while Mermaid loads in the background, and a loading indicator is shown in the preview area until Mermaid is ready

### Requirement: Centered preview display
The system SHALL center the rendered diagram both horizontally and vertically within the preview panel.

#### Scenario: Diagram centering
- **WHEN** a diagram is rendered in the preview
- **THEN** the diagram is centered in the preview panel regardless of its size
