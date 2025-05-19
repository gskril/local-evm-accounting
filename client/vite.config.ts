import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      server: path.resolve(__dirname, '../server/src'),
    },
  },
  optimizeDeps: {
    include: ['server/hc'],
  },
  build: {
    rollupOptions: {
      // TODO: figure out why these were being bundled in the first place.
      // I don't think we should have to specify these in the client build.
      external: ['bullmq', 'hono', 'ioredis', 'kysely', 'viem', 'zod'],
    },
  },
})
