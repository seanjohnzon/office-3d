import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/office-3d/',
  plugins: [react()],
  server: {
    host: true,
    port: 5174
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js core — largest single dep
          'vendor-three': ['three'],
          // React Three Fiber + Drei
          'vendor-r3f': ['@react-three/fiber', '@react-three/drei'],
          // Post-processing
          'vendor-post': ['@react-three/postprocessing', 'postprocessing'],
          // React core
          'vendor-react': ['react', 'react-dom'],
        }
      }
    }
  }
})
