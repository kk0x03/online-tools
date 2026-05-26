## 1. Backend Setup

- [x] 1.1 Create server/ directory with package.json (express, cors, dotenv)
- [x] 1.2 Create server/index.js: Express app with CORS, JSON parsing, /api/chat route
- [x] 1.3 Create server/routes/chat.js: POST /api/chat — validate messages, prepend system prompt, forward to OpenAI-compatible API with SSE stream
- [x] 1.4 Create server/.env.example with API_BASE_URL, API_KEY, MODEL_NAME defaults
- [x] 1.5 Add IP rate limiting (20 req/min) to /api/chat endpoint

## 2. Frontend Chat Utils

- [x] 2.1 Create src/utils/chat.js: fetch-based SSE request function, handles stream parsing and callback for each chunk

## 3. Chat UI Components

- [x] 3.1 Create ChatMessage.vue: render single message (user bubble / AI bubble), parse AI response for ```mermaid code blocks, render with adopt/discard buttons
- [x] 3.2 Create ChatPanel.vue: message list, input box, send button, collapse/expand toggle, manages conversation history and streaming state

## 4. Layout Integration

- [x] 4.1 Modify App.vue: split left panel into editor (60%) + ChatPanel (40%) with vertical divider, add collapse/expand control
- [x] 4.2 Wire ChatPanel to Editor: on adopt, update App's code ref; on send, pass current editor code as context
