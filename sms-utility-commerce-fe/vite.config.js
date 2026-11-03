import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    // xlsx is only imported from the upload worker, which Vite's dependency scan does not follow. Left
    // alone, Vite finds it the first time a file is uploaded, re-bundles its dependencies mid-session and
    // the worker fails to load (or never answers). Listing it here bundles it once, at startup.
    include: ['xlsx'],
  },
  worker: {
    format: 'es',
  },
})
