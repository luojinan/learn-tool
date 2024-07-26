# 移动端 vue3 项目

## 搭建

[tailwindcss 组件库 daisyui](https://daisyui.com/components/button/)

```bash
pnpm create vite
cd my-vite-project
pnpm i
pnpm dev

pnpm add -D tailwindcss postcss autoprefixer
pnpx tailwindcss init -p

pnpm add daisyui
```

👇 `tailwind.config.cjs`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}
```

👇 `main.ts`

```ts
import './reset.css'
import './style.css'
```

👇 `style.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 基建

`oxlint` + `eslint`，需要安装对应的 [IDE插件](https://oxc.rs/docs/guide/usage/linter.html#vscode-extension)

```json
// .vscode/settings.json
{
  "prettier.enable": false,
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  }
}
```

[unplugin-oxlint github](https://github.com/tmg0/unplugin-oxlint)

`unplugin-oxlint` based on oxlint [vite-plugin-oxlint](https://github.com/52-entertainment/vite-plugin-oxlint)

🤔 unplugin-oxlint 只是抹平了vite-plugin-oxlint在其他构建工具上使用？

```bash
pnpm add -D oxlint unplugin-oxlint
```

```ts
// vite.config.ts
import Oxlint from 'unplugin-oxlint/vite'

export default defineConfig({
  plugins: [Oxlint()],
})
```

oxlint 只有一小部分规则，因此仍然需要eslint，并且我们使用`@antfu/eslint-config`的eslint规则

```bash
pnpm add -D @antfu/eslint-config eslint eslint-plugin-oxlint
```

```js
// eslint.config.js
import antfu from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint'

export default antfu({
  ...oxlint.configs['flat/recommended'],
})
```

👆 如果你以前研究过eslint的配置文件，会发现没见过这种语法，这是 [eslint9版本](https://zh-hans.eslint.org/docs/latest/use/configure/configuration-files) 支持的所谓 `flat` 语法

[flat config eslint blog post](https://eslint.org/blog/2022/08/new-config-system-part-2/)

> eslint 和 oxlint 协同的方式，仅仅是通过插件匹配 [oxlint 支持的规则](https://oxc.rs/docs/guide/usage/linter/rules.html)，然后在 eslint 中关闭校验
>
> 实现在最终的执行里，2个校验工具都执行。相当于优先使用 oxlint，并且让eslint不要重复执行

## todo

- [x] feat: 进度数据缓存
- [ ] feat: 进度缓存有效期3天，过期强制从头开始背
- [x] feat: ios双击放大问题 - button元素双击问题，不使用button
- [ ] feat: N3单词库数据生成
- [ ] feat: toast、烟花动画
- [ ] feat: 白板根据罗马音/听默写功能
- [ ] feat: 手势功能
- [ ] feat: 虚拟键盘

- [ ] dev: 数据来源OSS
- [ ] dev: pwa缓存
- [ ] dev: gitee
- [ ] dev: 静态资源来源OSS
