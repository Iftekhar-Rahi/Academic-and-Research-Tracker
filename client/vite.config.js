import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward API calls to the Express server so we don't hit CORS issues in dev
      "/api": "http://localhost:5001",
    },
  },
})
