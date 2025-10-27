import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'force-copy-redirects',
      closeBundle() {
        const src = path.resolve(__dirname, 'public/_redirects')
        const distDir = path.resolve(__dirname, 'dist')
        const dest = path.join(distDir, '_redirects')

        // ✅ Si la carpeta dist no existe, la crea
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true })
          console.log('📁 Carpeta dist creada manualmente')
        }

        // ✅ Si el archivo existe, lo copia
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest)
          console.log('✅ _redirects copiado correctamente a dist/')
        } else {
          console.warn('⚠️ No se encontró public/_redirects — no se pudo copiar')
        }
      },
    },
  ],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
