/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the site from https://<user>.github.io/os-visualizer/
  base: command === 'build' || isPreview ? '/os-visualizer/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts'],
  },
}))
