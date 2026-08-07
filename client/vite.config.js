import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward API calls to the Express server so we don't hit CORS issues in dev
      // (5001, not 5000 - macOS's AirPlay Receiver squats on 5000, see server/.env's PORT)
      "/api": "http://localhost:5001",
    },
  },
})
