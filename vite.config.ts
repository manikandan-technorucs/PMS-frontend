import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    include: [
      'primereact/button',
      'primereact/datatable',
      'primereact/column',
      'primereact/dropdown',
      'primereact/multiselect',
      'primereact/inputtext',
      'primereact/calendar',
      'primereact/tag',
      'primereact/toast',
      'primereact/dialog',
      'primereact/fileupload',
      '@tanstack/react-query',
    ],
  },

  css: {
    devSourcemap: true,
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: false, // emit a single CSS bundle to prevent per-chunk FOUC
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('primereact')) return 'vendor-prime';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('axios')) return 'vendor-http';
            return 'vendor';
          }
        },
      },
    },
  },
})

