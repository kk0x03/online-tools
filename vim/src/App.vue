<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import SplitPane from '@/components/SplitPane.vue'
import Editor from '@/components/Editor.vue'
import Preview from '@/components/Preview.vue'
import Toolbar from '@/components/Toolbar.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import TutorialSection from '@/components/TutorialSection.vue'
import { storage } from '@/utils/storage.js'
import { getCurrentUser, requestEmailCode, verifyEmailCode, logout } from '@/utils/auth.js'
import { getCachedUsage, getUsageStatus } from '@/utils/usage.js'

const DEFAULT_CODE = `graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[结束]
    C --> D`

const uiState = storage.get('mermaid-ui', {})
const code = ref(storage.get('mermaid-code', DEFAULT_CODE))
const hasValidDiagram = ref(false)
const diagnostics = ref([])
const chatCollapsed = ref(uiState.chatCollapsed || false)
const splitRatio = ref(uiState.splitRatio || 0.5)
const chatRatio = ref(uiState.chatRatio || 0.4)
const authUser = ref(null)
const authLoading = ref(true)
const showLogin = ref(false)
const loginStep = ref('email')
const loginEmail = ref('')
const loginCode = ref('')
const loginError = ref('')
const loginBusy = ref(false)
const usageState = ref(getCachedUsage())

const chatStyle = computed(() => ({
  flex: `0 0 ${(chatRatio.value * 100).toFixed(2)}%`
}))

const usageSummary = computed(() => {
  const usage = usageState.value?.usage
  if (!usage) return ''

  const parts = []
  if (usage.chat?.remaining != null && usage.chat?.limit != null) {
    parts.push(`对话 ${usage.chat.remaining}/${usage.chat.limit}`)
  }
  if (usage.complete?.remaining != null && usage.complete?.limit != null) {
    parts.push(`补全 ${usage.complete.remaining}/${usage.complete.limit}`)
  }

  return parts.join(' · ')
})

onMounted(() => {
  loadAuthState()
  loadUsageState()
  window.addEventListener('ai-usage-updated', handleUsageUpdated)
})

onBeforeUnmount(() => {
  window.removeEventListener('ai-usage-updated', handleUsageUpdated)
})

async function loadAuthState() {
  authLoading.value = true
  try {
    const result = await getCurrentUser()
    authUser.value = result.authenticated ? result.user : null
  } catch {
    authUser.value = null
  } finally {
    authLoading.value = false
  }
}

function handleUsageUpdated(event) {
  usageState.value = event.detail || getCachedUsage()
}

async function loadUsageState() {
  usageState.value = getCachedUsage()
  try {
    usageState.value = await getUsageStatus()
  } catch {
    // Usage status is display-only; AI endpoints still enforce limits server-side.
  }
}

// Resize handle for editor/chat split
const leftPanelRef = ref(null)
let resizeStartY = 0
let resizeStartHeight = 0

function startResize(e) {
  e.preventDefault()
  const panel = leftPanelRef.value
  if (!panel) return
  resizeStartY = e.clientY
  resizeStartHeight = panel.querySelector('.chat-area')?.offsetHeight || 0
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
}

function onResize(e) {
  const panel = leftPanelRef.value
  if (!panel) return
  const totalHeight = panel.clientHeight
  if (totalHeight <= 0) return
  const dy = e.clientY - resizeStartY
  const newHeight = resizeStartHeight - dy
  const minH = 80
  const maxH = totalHeight - 80
  const clamped = Math.max(minH, Math.min(maxH, newHeight))
  chatRatio.value = clamped / totalHeight
}

function stopResize() {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  saveUiState()
}

function saveUiState() {
  storage.set('mermaid-ui', {
    chatCollapsed: chatCollapsed.value,
    splitRatio: splitRatio.value,
    chatRatio: chatRatio.value
  })
}

// Auto-save code with 1s debounce
let codeTimer = null
watch(code, (val) => {
  clearTimeout(codeTimer)
  codeTimer = setTimeout(() => {
    storage.set('mermaid-code', val)
    savedCodeSnapshot.value = val
  }, 1000)
})

// Save UI state on change
watch([chatCollapsed, splitRatio, chatRatio], () => {
  saveUiState()
})

function toggleChat() {
  chatCollapsed.value = !chatCollapsed.value
}

function onAdopt(newCode) {
  code.value = newCode
}

const savedCodeSnapshot = ref(code.value)

function tryTutorialCode(newCode) {
  const current = code.value.trim()
  const saved = savedCodeSnapshot.value.trim()
  if (current && current !== saved && current !== DEFAULT_CODE.trim()) {
    if (!confirm('编辑器中有未保存的内容，确定要替换吗？')) return
  }
  code.value = newCode
  savedCodeSnapshot.value = newCode
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onRatioChange(ratio) {
  splitRatio.value = ratio
}

function openLogin() {
  loginStep.value = 'email'
  loginEmail.value = authUser.value?.email || ''
  loginCode.value = ''
  loginError.value = ''
  showLogin.value = true
}

function closeLogin() {
  if (loginBusy.value) return
  showLogin.value = false
  loginError.value = ''
}

async function submitEmail() {
  const email = loginEmail.value.trim()
  if (!email) {
    loginError.value = '请输入邮箱地址'
    return
  }

  loginBusy.value = true
  loginError.value = ''
  try {
    await requestEmailCode(email)
    loginEmail.value = email
    loginStep.value = 'code'
  } catch (err) {
    loginError.value = err.message
  } finally {
    loginBusy.value = false
  }
}

async function submitCode() {
  const codeValue = loginCode.value.trim()
  if (!codeValue) {
    loginError.value = '请输入验证码'
    return
  }

  loginBusy.value = true
  loginError.value = ''
  try {
    const result = await verifyEmailCode(loginEmail.value.trim(), codeValue)
    authUser.value = result.authenticated ? result.user : null
    showLogin.value = false
    loginCode.value = ''
    loadUsageState()
  } catch (err) {
    loginError.value = err.message
  } finally {
    loginBusy.value = false
  }
}

async function handleLogout() {
  authLoading.value = true
  try {
    await logout()
  } catch {
    // Local account state still returns to anonymous; server clears stale cookies when possible.
  } finally {
    authUser.value = null
    authLoading.value = false
    loadUsageState()
  }
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">Mermaid 在线编辑器</h1>
        </div>
        <div class="header-actions">
          <Toolbar :has-valid-diagram="hasValidDiagram" />
          <div v-if="usageSummary" class="usage-summary" title="AI 使用次数">
            {{ usageSummary }}
          </div>
          <div class="account-controls">
            <template v-if="authUser">
              <span class="account-email" :title="authUser.email">{{ authUser.email }}</span>
              <button class="account-btn" :disabled="authLoading" @click="handleLogout">退出</button>
            </template>
            <button v-else class="account-btn account-btn-primary" :disabled="authLoading" @click="openLogin">
              {{ authLoading ? '检查中' : '登录' }}
            </button>
          </div>
        </div>
      </div>
    </header>
    <main class="main">
      <SplitPane :initial-ratio="splitRatio" @ratio-change="onRatioChange">
        <template #left>
          <div class="left-panel" ref="leftPanelRef">
            <div class="editor-area">
              <Editor v-model="code" :diagnostics="diagnostics" />
            </div>
            <div v-if="!chatCollapsed" class="resize-handle" @mousedown="startResize"></div>
            <div class="chat-area" v-if="!chatCollapsed" :style="chatStyle">
              <ChatPanel :editor-code="code" @adopt="onAdopt" @toggle="toggleChat" />
            </div>
            <button v-if="chatCollapsed" class="chat-toggle chat-toggle-collapsed" @click="toggleChat">
              AI 助手 ▲
            </button>
          </div>
        </template>
        <template #right>
          <Preview v-model:has-valid-diagram="hasValidDiagram" :code="code" @error="diagnostics = $event" />
        </template>
      </SplitPane>
    </main>
    <TutorialSection @try-code="tryTutorialCode" />
    <footer class="footer">v1.0</footer>
    <div v-if="showLogin" class="login-overlay" @click.self="closeLogin">
      <form class="login-dialog" @submit.prevent="loginStep === 'email' ? submitEmail() : submitCode()">
        <div class="login-header">
          <h2 class="login-title">邮箱登录</h2>
          <button type="button" class="login-close" :disabled="loginBusy" @click="closeLogin">×</button>
        </div>
        <div v-if="loginStep === 'email'" class="login-body">
          <label class="login-label" for="login-email">邮箱</label>
          <input
            id="login-email"
            v-model="loginEmail"
            class="login-input"
            type="email"
            autocomplete="email"
            :disabled="loginBusy"
            autofocus
          />
        </div>
        <div v-else class="login-body">
          <div class="login-email-target">{{ loginEmail }}</div>
          <label class="login-label" for="login-code">验证码</label>
          <input
            id="login-code"
            v-model="loginCode"
            class="login-input login-code-input"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            :disabled="loginBusy"
          />
        </div>
        <div v-if="loginError" class="login-error">{{ loginError }}</div>
        <div class="login-actions">
          <button
            v-if="loginStep === 'code'"
            type="button"
            class="login-secondary"
            :disabled="loginBusy"
            @click="loginStep = 'email'; loginCode = ''; loginError = ''"
          >
            返回
          </button>
          <button class="login-submit" type="submit" :disabled="loginBusy">
            {{ loginBusy ? '处理中' : (loginStep === 'email' ? '发送验证码' : '登录') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  background: #fff;
  color: #333;
}

#app {
  width: 100%;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-height: 100vh;
}

.header {
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 50px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.account-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.usage-summary {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
  font-size: 12px;
}

.account-email {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
  font-size: 13px;
}

.account-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.account-btn:hover:not(:disabled) {
  color: #409eff;
  border-color: #409eff;
}

.account-btn-primary {
  color: #409eff;
  border-color: #409eff;
}

.account-btn-primary:hover:not(:disabled) {
  background: #409eff;
  color: #fff;
}

.account-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.main {
  flex: 1;
  height: calc(100vh - 50px - 30px);
  overflow: hidden;
  display: flex;
}

.left-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.editor-area {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.chat-area {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  flex-shrink: 0;
}

.resize-handle {
  height: 6px;
  background: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  cursor: row-resize;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.resize-handle:hover {
  background: #409eff;
}

.chat-toggle {
  flex-shrink: 0;
  padding: 4px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.chat-toggle:hover {
  color: #409eff;
  background: #f0f7ff;
}

.footer {
  text-align: center;
  padding: 6px 0;
  color: #999;
  font-size: 12px;
  border-top: 1px solid #eee;
  background: #fff;
  flex-shrink: 0;
}

.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.28);
}

.login-dialog {
  width: min(360px, 100%);
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.login-title {
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.login-close {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: #999;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.login-close:hover:not(:disabled) {
  color: #333;
}

.login-body {
  padding: 16px;
}

.login-label {
  display: block;
  margin-bottom: 6px;
  color: #666;
  font-size: 13px;
}

.login-input {
  width: 100%;
  height: 36px;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
}

.login-input:focus {
  border-color: #409eff;
}

.login-code-input {
  letter-spacing: 2px;
  font-family: Menlo, Monaco, Consolas, monospace;
}

.login-email-target {
  margin-bottom: 12px;
  color: #333;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.login-error {
  margin: 0 16px;
  padding: 8px 10px;
  border: 1px solid #ffa39e;
  border-radius: 4px;
  background: #fff1f0;
  color: #cf1322;
  font-size: 12px;
  line-height: 1.4;
}

.login-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 16px;
  border-top: 1px solid #f0f0f0;
}

.login-secondary,
.login-submit {
  padding: 7px 14px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.login-secondary {
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #666;
}

.login-submit {
  border: 1px solid #409eff;
  background: #409eff;
  color: #fff;
}

.login-secondary:disabled,
.login-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .header-content {
    padding: 0 10px;
  }

  .app-title {
    font-size: 15px;
  }

  .header-actions {
    gap: 8px;
  }

  .account-email {
    max-width: 110px;
  }
}
</style>
