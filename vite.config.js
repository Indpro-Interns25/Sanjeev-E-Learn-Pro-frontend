import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            bootstrap: ['bootstrap', 'react-bootstrap', '@popperjs/core'],
            charts: ['chart.js', 'react-chartjs-2'],
            sockets: ['socket.io-client'],
            pdf: ['html2canvas', 'jspdf'],
          },
        },
      },
    },
    server: {
      port: 3000,
      strictPort: true, // Force port 3000, fail if not available
      open: true,
      // Proxy /api requests to the backend (useful when code issues relative /api/... requests)
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
})
