import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
    '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/bills': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ai': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
})
