## MODIFIED Requirements

### Requirement: Left-right split layout
The system SHALL display the editor in the left panel and the preview in the right panel. The split ratio and chat panel collapsed state SHALL persist to localStorage and restore on page reload.

#### Scenario: Layout restored on page load
- **WHEN** user opens the page and localStorage contains saved UI state
- **THEN** the split ratio and chat panel collapsed state are restored to their saved values

#### Scenario: Split ratio auto-saved
- **WHEN** user drags the divider to change the split ratio
- **THEN** the new ratio is saved to localStorage immediately

#### Scenario: Chat panel state auto-saved
- **WHEN** user toggles the chat panel collapse/expand
- **THEN** the new state is saved to localStorage immediately
