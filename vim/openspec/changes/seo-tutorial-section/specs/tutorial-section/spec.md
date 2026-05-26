## ADDED Requirements

### Requirement: Tutorial section layout
The system SHALL display a tutorial section below the editor area on the main page. The tutorial section SHALL consist of a left sidebar navigation and a right content area.

#### Scenario: Tutorial section is visible below editor
- **WHEN** user scrolls past the editor area
- **THEN** the tutorial section is displayed with sidebar navigation on the left and content area on the right

### Requirement: Sidebar navigation
The system SHALL provide a sidebar navigation listing all supported Mermaid diagram types. The sidebar SHALL be sticky so it remains visible while scrolling through tutorial content. Each navigation item SHALL scroll to the corresponding tutorial section when clicked.

#### Scenario: Sidebar lists all diagram types
- **WHEN** the tutorial section is visible
- **THEN** the sidebar shows navigation links for all 15+ diagram types: flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, gitGraph, journey, mindmap, timeline, quadrantChart, sankey, xychart, block

#### Scenario: Sidebar navigation scrolls to section
- **WHEN** user clicks a diagram type in the sidebar
- **THEN** the page scrolls to the corresponding tutorial section identified by anchor `#tutorial-{slug}`

### Requirement: Tutorial content for each diagram type
The system SHALL display tutorial content for each Mermaid diagram type. Each tutorial SHALL include: a title, a brief description, one or more sections with syntax explanations and example code blocks.

#### Scenario: Tutorial displays flowchart content
- **WHEN** user navigates to the flowchart tutorial
- **THEN** the content area shows the flowchart title, description, syntax explanation, and at least one runnable example code block

#### Scenario: All diagram types have tutorials
- **WHEN** user views the tutorial section
- **THEN** tutorials exist for every supported diagram type: flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, gitGraph, journey, mindmap, timeline, quadrantChart, sankey, xychart, block

### Requirement: Try it button
Each example code block SHALL have a "试试" (Try it) button. When clicked, the system SHALL load the example code into the editor and smoothly scroll to the top of the page.

#### Scenario: Try it loads code into editor
- **WHEN** user clicks the "试试" button on an example
- **THEN** the example code replaces the current editor content
- **AND** the page smoothly scrolls to the top so the editor is visible

#### Scenario: Try it warns on unsaved editor content
- **WHEN** user clicks the "试试" button
- **AND** the editor contains user-modified content that differs from the last auto-saved state
- **THEN** the system SHALL show a confirmation prompt before replacing the editor content

### Requirement: Anchor links for tutorials
Each tutorial section SHALL have an HTML id attribute in the format `tutorial-{slug}` (e.g., `tutorial-flowchart`, `tutorial-sequencediagram`) to support direct linking and anchor navigation.

#### Scenario: Direct link to a specific tutorial
- **WHEN** user navigates to `https://mermaid.toolkithub.net/#tutorial-flowchart`
- **THEN** the page loads and scrolls to the flowchart tutorial section

### Requirement: Data-driven tutorial architecture
Tutorial content SHALL be stored as separate data files under `src/tutorials/data/`, one file per diagram type. A central `src/tutorials/index.js` SHALL export an array of all tutorial data objects.

#### Scenario: Adding a new diagram type tutorial
- **WHEN** a new data file is added to `src/tutorials/data/` and registered in `src/tutorials/index.js`
- **THEN** the new tutorial automatically appears in the sidebar navigation and content area without modifying any Vue components
