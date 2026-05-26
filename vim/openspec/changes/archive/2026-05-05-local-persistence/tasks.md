## 1. Storage Utility

- [x] 1.1 Create src/utils/storage.js: get/set/remove with JSON serialization, try/catch error handling

## 2. Editor Code Persistence

- [x] 2.1 Modify App.vue: initialize code from storage.get('mermaid-code', ''), add watch with 1s debounce to save code changes
- [x] 2.2 Modify Editor.vue: accept restored code as initial value (remove hardcoded default when storage has data)

## 3. Chat History Persistence

- [x] 3.1 Modify ChatPanel.vue: initialize messages from storage.get('mermaid-chat', []), save after each AI response completes (onDone/onError), cap at 20 messages

## 4. UI State Persistence

- [x] 4.1 Modify App.vue: initialize chatCollapsed from storage, watch and save on toggle
- [x] 4.2 Modify SplitPane.vue: accept initial ratio prop, emit ratio changes, persist via parent
