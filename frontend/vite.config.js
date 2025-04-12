import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 👈 This is the missing link!
    port: 5173        // Optional: explicitly set the port
  }
})
