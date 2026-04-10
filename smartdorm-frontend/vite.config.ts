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
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/auth': { target: 'http://localhost:5000', changeOrigin: true },
      '/rooms': { target: 'http://localhost:5000', changeOrigin: true },
      '/users': { target: 'http://localhost:5000', changeOrigin: true },
      '/areas': { target: 'http://localhost:5000', changeOrigin: true },
      '/bills': { target: 'http://localhost:5000', changeOrigin: true },
      '/payments': { target: 'http://localhost:5000', changeOrigin: true },
      '/maintenance': { target: 'http://localhost:5000', changeOrigin: true },
      '/visitors': { target: 'http://localhost:5000', changeOrigin: true },
      '/messages': { target: 'http://localhost:5000', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:5000', changeOrigin: true },
      '/services': { target: 'http://localhost:5000', changeOrigin: true },
      '/notifications': { target: 'http://localhost:5000', changeOrigin: true },
      '/upload': { target: 'http://localhost:5000', changeOrigin: true },
      '/rental-requests': { target: 'http://localhost:5000', changeOrigin: true },
      '/ai': { target: 'http://localhost:5000', changeOrigin: true },
      '/api': { target: 'http://localhost:5000', changeOrigin: true }
    }
  },
})
