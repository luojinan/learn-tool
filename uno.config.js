// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      'btn': 'bg-black flex items-center py-2 px-6 rounded-lg shadow-md',
      'flex-center': 'flex items-center justify-center'
    },
  ],
  theme: {
    colors: {
      // ...
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons()
  ],
})