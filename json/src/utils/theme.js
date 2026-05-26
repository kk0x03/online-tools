import { ref } from 'vue'
import { storage } from './storage.js'

export const isDark = ref(storage.get('json-theme', 'light') === 'dark')

export function toggleTheme() {
  isDark.value = !isDark.value
  storage.set('json-theme', isDark.value ? 'dark' : 'light')
}
