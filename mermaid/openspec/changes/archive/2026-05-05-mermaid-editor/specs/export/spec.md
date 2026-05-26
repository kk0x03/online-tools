## ADDED Requirements

### Requirement: Export as SVG
The system SHALL allow users to export the current diagram as an SVG file via a button in the toolbar.

#### Scenario: Click export SVG button
- **WHEN** user clicks the "Export SVG" button and a valid diagram is rendered
- **THEN** the browser downloads an SVG file containing the current diagram

#### Scenario: Export SVG with no diagram
- **WHEN** user clicks the "Export SVG" button and no valid diagram is rendered (error or empty)
- **THEN** the export button is disabled or displays a message indicating no diagram to export

### Requirement: Export as PNG
The system SHALL allow users to export the current diagram as a PNG file via a button in the toolbar, using a 2x scale factor for quality.

#### Scenario: Click export PNG button
- **WHEN** user clicks the "Export PNG" button and a valid diagram is rendered
- **THEN** the browser downloads a PNG file (2x resolution) containing the current diagram

#### Scenario: Export PNG with no diagram
- **WHEN** user clicks the "Export PNG" button and no valid diagram is rendered
- **THEN** the export button is disabled or displays a message indicating no diagram to export

### Requirement: Toolbar placement
The system SHALL place export buttons (SVG and PNG) in the header toolbar area, visually consistent with the overall design style.

#### Scenario: Toolbar visibility
- **WHEN** the page loads
- **THEN** the "Export SVG" and "Export PNG" buttons are visible in the header toolbar
