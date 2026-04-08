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
      'recharts',
      'framer-motion',
    ],
  },

  css: {
    devSourcemap: false,
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    target: 'esnext',          // Modern browsers only — smaller, faster output
    sourcemap: false,           // No source maps in production (reduces bundle size)
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: false,        // Single CSS bundle — prevents per-chunk FOUC

    // Drop console.* and debugger statements from production builds
    minify: 'esbuild',
    esbuildOptions: {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    },

    rollupOptions: {
      output: {
        // Granular vendor splitting for optimal caching across deploys
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts'))          return 'vendor-charts';
            if (id.includes('framer-motion'))     return 'vendor-animation';
            if (id.includes('primereact'))        return 'vendor-prime';
            if (id.includes('primeicons'))        return 'vendor-prime';
            if (id.includes('lucide-react'))      return 'vendor-icons';
            if (id.includes('@tanstack'))         return 'vendor-query';
            if (id.includes('axios'))             return 'vendor-http';
            
            // React and Router can be bundled into a generic vendor-react or left to default vendor. 
            // Removed react-router-dom, react-hook-form, react-dnd to avoid circular dependency with generic vendor chunk.
            return 'vendor';
          }
        },
      },
    },
  },
})
