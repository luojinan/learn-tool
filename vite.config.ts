// import { fileURLToPath, URL } from "node:url";
import path from 'path'
import vue from '@vitejs/plugin-vue'
// import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from 'vite'
import Oxlint from 'unplugin-oxlint/vite'

const projectRootDir = path.resolve(__dirname)

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
      '@': path.resolve(projectRootDir, 'src'),
    },
  },
})
