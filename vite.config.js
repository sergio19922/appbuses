import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Configuración optimizada para Render y React Router
export default defineConfig({
  plugins: [react()],
  base: '/', // 👈 Muy importante para que las rutas funcionen en Render
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173, // Puedes cambiarlo si lo necesitas en local
    open: true,
  },
})
