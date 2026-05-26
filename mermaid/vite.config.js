import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

function toWebSocketTarget(target) {
  return target.replace(/^http/i, 'ws')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true
        },
        '/ws': {
          target: toWebSocketTarget(proxyTarget),
          ws: true,
          changeOrigin: true
        }
      }
    }
  }
})
