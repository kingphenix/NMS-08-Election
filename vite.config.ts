import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react/')) {
              return 'vendor'
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('recharts')) {
              return 'ui'
            }
            if (id.includes('@supabase')) {
              return 'supabase'
            }
          }
        },
      },
    },
  },
})
