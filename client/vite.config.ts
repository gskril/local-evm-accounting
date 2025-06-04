import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server/hc': path.resolve(__dirname, '../server/dist/hc.d.ts'),
    },
  },
  preview: {
    port: 8580,
  },
})
