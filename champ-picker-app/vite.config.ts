import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Champ-Picker/', // MUST match the repo name exactly (case-sensitive)
})
