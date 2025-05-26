import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/DynamicEventCalendar/',  // 👈 Important! Use your repo name here with slashes
  plugins: [react()],
})
