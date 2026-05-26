## 1. Tutorial Data Files

- [x] 1.1 Create `src/tutorials/data/flowchart.js` — flowchart tutorial data with 3-4 sections (basic syntax, node shapes, connections, subgraphs)
- [x] 1.2 Create `src/tutorials/data/sequence.js` — sequenceDiagram tutorial data
- [x] 1.3 Create `src/tutorials/data/classDiagram.js` — classDiagram tutorial data
- [x] 1.4 Create `src/tutorials/data/stateDiagram.js` — stateDiagram tutorial data
- [x] 1.5 Create `src/tutorials/data/erDiagram.js` — ER diagram tutorial data
- [x] 1.6 Create `src/tutorials/data/gantt.js` — gantt chart tutorial data
- [x] 1.7 Create `src/tutorials/data/pie.js` — pie chart tutorial data
- [x] 1.8 Create `src/tutorials/data/gitGraph.js` — git graph tutorial data
- [x] 1.9 Create `src/tutorials/data/journey.js` — user journey tutorial data
- [x] 1.10 Create `src/tutorials/data/mindmap.js` — mindmap tutorial data
- [x] 1.11 Create `src/tutorials/data/timeline.js` — timeline tutorial data
- [x] 1.12 Create `src/tutorials/data/quadrant.js` — quadrant chart tutorial data
- [x] 1.13 Create `src/tutorials/data/sankey.js` — sankey diagram tutorial data
- [x] 1.14 Create `src/tutorials/data/xychart.js` — xy chart tutorial data
- [x] 1.15 Create `src/tutorials/data/block.js` — block diagram tutorial data
- [x] 1.16 Create `src/tutorials/index.js` — central registry exporting array of all tutorial data

## 2. Tutorial UI Components

- [x] 2.1 Create `src/components/TutorialSection.vue` — main wrapper component containing sidebar and content area
- [x] 2.2 Create `src/components/TutorialNav.vue` — sticky sidebar navigation listing all diagram types, emits selection events
- [x] 2.3 Create `src/components/TutorialContent.vue` — renders tutorial data: title, description, sections with code blocks and "试试" buttons

## 3. Integration

- [x] 3.1 Update `src/App.vue` — add TutorialSection below the editor area, wire up "试试" button to set editor code and scroll to top
- [x] 3.2 Add unsaved content confirmation — when "试试" is clicked and editor has unsaved changes, show a confirm dialog

## 4. SEO Enhancements

- [x] 4.1 Update `index.html` — enhance meta description and keywords to include tutorial-related terms
- [x] 4.2 Add Open Graph meta tags to `index.html` — og:title, og:description, og:type, og:url
- [x] 4.3 Add JSON-LD structured data to `index.html` — HowTo schema for the Mermaid tutorial resource

## 5. Styling

- [x] 5.1 Add tutorial section styles — sidebar layout, sticky positioning, code block styling, responsive design for mobile
