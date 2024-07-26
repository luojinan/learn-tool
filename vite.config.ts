import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
// import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from 'vite'
import Oxlint from 'unplugin-oxlint/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/learn-tool/',
  plugins: [
    vue(),
    Oxlint({
      includes: ['src/**/*.{ts,vue}'],
    }),
    // visualizer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
