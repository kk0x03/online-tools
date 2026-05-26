## ADDED Requirements

### Requirement: Left-right split layout
The system SHALL display the editor in the left panel and the preview in the right panel, each occupying 50% of the available width by default.

#### Scenario: Default layout on load
- **WHEN** user opens the page
- **THEN** the left panel (editor) and right panel (preview) each occupy 50% of the viewport width below the header

### Requirement: Draggable split divider
The system SHALL provide a draggable divider between the two panels, allowing users to resize the panels by dragging.

#### Scenario: Drag divider to resize
- **WHEN** user clicks and drags the divider left or right
- **THEN** the left and right panel widths adjust in real-time to follow the cursor, with a minimum width of 200px for each panel

#### Scenario: Panel minimum width constraint
- **WHEN** user drags the divider such that either panel would be narrower than 200px
- **THEN** the divider stops at the 200px boundary and cannot be dragged further

### Requirement: Full viewport layout
The system SHALL use the full browser viewport (100vw x 100vh) for the layout, with no scrolling on the main page.

#### Scenario: No page scroll
- **WHEN** the page is loaded on a standard desktop viewport
- **THEN** the entire layout fits within the viewport without requiring page-level scrolling. Each panel handles its own internal scrolling.
