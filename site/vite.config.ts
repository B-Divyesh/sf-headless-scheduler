import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      'react-dom/client': 'preact/compat/client',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      'react': 'preact/compat'
    }
  },
  build: { target: 'es2022', outDir: resolve(__dirname, '../dist/site'), emptyOutDir: true, sourcemap: true },
  server: { host: '0.0.0.0' }
})
