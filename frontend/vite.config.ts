import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000,
  
    
    proxy: {
      '/chat': 'http://localhost',
      '/api': {
        target: 'http://localhost',  // Django backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/,""),
        secure: false,
      },
    },
    
  }
})
