## ADDED Requirements

### Requirement: Semantic HTML structure
The tutorial section SHALL use semantic HTML elements: `<section>` for each tutorial, `<nav>` for the sidebar, `<aside>` for the sidebar container, `<article>` for tutorial content, and proper heading hierarchy (`<h2>` for tutorial titles, `<h3>` for section titles).

#### Scenario: Page uses semantic elements
- **WHEN** the tutorial section is rendered
- **THEN** each diagram type tutorial is wrapped in a `<section>` element with an `<h2>` heading
- **AND** sub-sections use `<h3>` headings
- **AND** the sidebar uses `<nav>` inside `<aside>`

### Requirement: Enhanced meta tags
The system SHALL update the index.html meta description to include tutorial-related keywords. The description SHALL mention that the site provides tutorials for all Mermaid diagram types. Keywords SHALL be expanded to include individual diagram type names.

#### Scenario: Meta description mentions tutorials
- **WHEN** the HTML page is loaded
- **THEN** the meta description includes references to Mermaid tutorials and diagram types
- **AND** the meta keywords include terms like "mermaid教程", "流程图教程", "时序图语法" etc.

### Requirement: Open Graph tags
The system SHALL include Open Graph meta tags in index.html: `og:title`, `og:description`, `og:type`, and `og:url` to enable rich previews when the page is shared on social media.

#### Scenario: Open Graph tags present
- **WHEN** the HTML page is loaded
- **THEN** the `<head>` contains `<meta property="og:title" content="...">`, `<meta property="og:description" content="...">`, `<meta property="og:type" content="website">`, and `<meta property="og:url" content="...">`

### Requirement: JSON-LD structured data
The system SHALL include JSON-LD structured data in index.html using the HowTo schema, describing the site as a tool for learning Mermaid diagram syntax. This helps Google display rich results in search.

#### Scenario: JSON-LD HowTo schema present
- **WHEN** the HTML page is loaded
- **THEN** the `<head>` contains a `<script type="application/ld+json">` block with a valid HowTo schema describing the Mermaid tutorial resource
