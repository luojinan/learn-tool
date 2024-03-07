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
      'btn': 'bg-black flex items-center justify-center py-2 px-6 rounded-lg shadow-md',
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
    presetIcons({
      cdn: 'https://esm.sh/',
      collections: {
        // carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        // mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
        logos: () => import('@iconify-json/logos/icons.json').then(i => i.default),
      }
    })
  ],
})