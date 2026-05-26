## MODIFIED Requirements

### Requirement: Left-right split layout
The system SHALL display the editor in the left panel and the preview in the right panel, each occupying 50% of the available width by default. The left panel is further divided into a code editor area (top 60%) and an AI chat panel (bottom 40%).

#### Scenario: Default layout on load
- **WHEN** user opens the page
- **THEN** the left panel is split vertically: code editor (top 60%) and AI chat panel (bottom 40%). The right panel (preview) occupies 50% of the viewport width.

#### Scenario: Chat panel collapsed layout
- **WHEN** user collapses the AI chat panel
- **THEN** the code editor expands to fill the entire left panel height. The preview panel is unchanged.

#### Scenario: Drag divider to resize
- **WHEN** user clicks and drags the vertical divider between left and right panels
- **THEN** the left and right panel widths adjust in real-time, with a minimum width of 200px for each panel. The internal top/bottom split of the left panel is unaffected.
