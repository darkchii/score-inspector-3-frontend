import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Enable CSS Modules for all .less files
      scopeBehaviour: 'local'
    },
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks: {
        //   // Split vendor chunks for better caching
        //   'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
        //   'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
        //   'mui-icons': ['@mui/icons-material'],
        //   'mui-charts': ['@mui/x-charts', '@mui/x-data-grid', '@mui/x-date-pickers'],
        //   'charts': ['chart.js', 'react-chartjs-2', 'chartjs-adapter-moment', 'chartjs-plugin-annotation'],
        //   'd3': ['d3'],
        //   'utils': ['axios', 'moment'],
        // },
      },
    },
    // Increase chunk size warning limit (optional, helps identify large chunks)
    chunkSizeWarningLimit: 1000,
    // Use esbuild for minification (faster than terser)
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', 'axios'],
  },
})
