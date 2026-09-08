import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: { rollupOptions: { input: { home: path.resolve(__dirname, 'index.html'), atlas: path.resolve(__dirname, 'play-atlas/index.html') } } },
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
