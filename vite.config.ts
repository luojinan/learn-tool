// import { fileURLToPath, URL } from "node:url";
import vue from '@vitejs/plugin-vue';
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { presetAttributify, presetIcons, presetUno } from 'unocss';
import Unocss from 'unocss/vite';
import { defineConfig } from 'vite';
const projectRootDir = path.resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  base: '/learn-tool/',
  plugins: [
    vue(),
    Unocss({
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons()
      ],
    }),
    visualizer(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(projectRootDir,'src')
    }
  },
})
