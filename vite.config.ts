import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    target: 'es2022', sourcemap: true, minify: 'esbuild', outDir: 'dist/package', emptyOutDir: true,
    lib: { entry: { index: resolve(__dirname, 'src/index.ts'), react: resolve(__dirname, 'src/react.tsx') }, formats: ['es', 'cjs'], fileName: (format, name) => `${name}.${format === 'es' ? 'js' : 'cjs'}` },
    rollupOptions: { external: ['react', 'react/jsx-runtime'] }
  }
})
