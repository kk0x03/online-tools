## ADDED Requirements

### Requirement: CodeMirror 6 editor with line numbers
The system SHALL display a CodeMirror 6 editor in the left panel with line numbers, monospace font, and a light theme matching the overall design (#fff background, #333 text).

#### Scenario: Editor renders on page load
- **WHEN** user opens the page
- **THEN** the CodeMirror editor is displayed in the left panel with line numbers visible and a default flowchart example code pre-filled

#### Scenario: Editor accepts user input
- **WHEN** user types or modifies code in the editor
- **THEN** the editor content updates and the change is emitted to the parent component

### Requirement: Default Mermaid example
The system SHALL pre-fill the editor with a default flowchart example on initial load, providing a starting point for new users.

#### Scenario: First visit shows example code
- **WHEN** user opens the editor for the first time
- **THEN** the editor contains a valid Mermaid flowchart example that renders successfully in the preview

### Requirement: Monospace font styling
The system SHALL use a monospace font (e.g., Menlo, Monaco, Consolas, monospace) at 14px for the editor content area.

#### Scenario: Font rendering
- **WHEN** the editor is displayed
- **THEN** code text uses a monospace font family at 14px size
