import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
// import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        name: 'tool',
        short_name: 'tool',
        description: 'tool APP',
        theme_color: '#141414',
        icons: [
          {
            src: '/learn-tool/192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/learn-tool/512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        shortcuts: [ // 配置快捷方式，指定打开页面地址
          {
            name: '打开首页', // 快捷方式名称
            short_name: '首页', // 快捷方式简称
            description: '打开首页', // 快捷方式描述
            url: '/', // 快捷方式链接地址
            icons: [{ src: '/learn-tool/vite.svg', sizes: '36x36' }], // 快捷方式图标配置
          },
        ],
      },
    }),
    // visualizer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    conditions: ['module', 'browser', 'development'],
  },
})
