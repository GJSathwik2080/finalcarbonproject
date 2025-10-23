import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Vite uses 'dist' instead of 'build'
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          aws: ['aws-amplify']
        }
      }
    }
  },
  define: {
    'process.env': {}  // Fixes AWS Amplify compatibility issues
  }
})
