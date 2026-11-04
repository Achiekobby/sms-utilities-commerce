import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const root = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    // Keep a single React instance so libraries like reapop do not call hooks on a second copy.
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(root, 'node_modules/react'),
      'react-dom': path.resolve(root, 'node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    // xlsx is only imported from the upload worker, which Vite's dependency scan does not follow. Left
    // alone, Vite finds it the first time a file is uploaded, re-bundles its dependencies mid-session and
    // the worker fails to load (or never answers). Listing it here bundles it once, at startup.
    include: ['xlsx', 'reapop', 'react', 'react-dom'],
  },
  worker: {
    format: 'es',
  },
})
