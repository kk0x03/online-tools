## MODIFIED Requirements

### Requirement: CodeMirror 6 editor with line numbers
The system SHALL display a CodeMirror 6 editor in the left panel with line numbers, monospace font, and a light theme matching the overall design (#fff background, #333 text). On mount, the editor SHALL restore code from localStorage if available, otherwise use the default example.

#### Scenario: Editor restores saved code on page load
- **WHEN** user opens the page and localStorage contains saved code
- **THEN** the editor is initialized with the saved code instead of the default example

#### Scenario: Editor auto-saves code changes
- **WHEN** user modifies code in the editor and 1 second has elapsed since the last change
- **THEN** the current code is saved to localStorage

#### Scenario: First visit shows default example
- **WHEN** user opens the editor for the first time and localStorage is empty
- **THEN** the editor contains the default flowchart example
