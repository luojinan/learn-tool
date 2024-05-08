// import { fileURLToPath, URL } from "node:url";
import vue from '@vitejs/plugin-vue';
import path from "path";
// import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from 'vite';
const projectRootDir = path.resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  base: '/learn-tool/',
  plugins: [
    vue(),
    // visualizer(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(projectRootDir,'src')
    }
  },
})
