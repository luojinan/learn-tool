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

`oxlint` + `eslint`，需要安装对应的 [IDE 插件](https://oxc.rs/docs/guide/usage/linter.html#vscode-extension)

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

🤔 unplugin-oxlint 只是抹平了 vite-plugin-oxlint 在其他构建工具上使用？

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

oxlint 只有一小部分规则，因此仍然需要 eslint，并且我们使用 `@antfu/eslint-config` 的 eslint 规则

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

👆 如果你以前研究过 eslint 的配置文件，会发现没见过这种语法，这是 [eslint9 版本](https://zh-hans.eslint.org/docs/latest/use/configure/configuration-files) 支持的所谓 `flat` 语法

[flat config eslint blog post](https://eslint.org/blog/2022/08/new-config-system-part-2/)

> eslint 和 oxlint 协同的方式，仅仅是通过插件匹配 [oxlint 支持的规则](https://oxc.rs/docs/guide/usage/linter/rules.html)，然后在 eslint 中关闭校验
>
> 实现在最终的执行里，2 个校验工具都执行。相当于优先使用 oxlint，并且让 eslint 不要重复执行

## 数据管理演进

### 数据获取与缓存机制

1. **UMD 数据加载改为 API 请求** (2025-01-07)
   - 从 OSS 加载 UMD 数据改为请求 API 接口 - [cloudflare worker d1 - github](https://github.com/luojinan/an-monkey-tool/tree/main/apps/an-monkey-worker)
   - 保留本地缓存功能
   - 实现方式：
     - 修改 `cacheDataOrUmd` 函数，用 `fetch` 替代 `loadScript`
     - 使用 `localStorage` 保存 API 返回的数据
     - 接口地址：`https://monkey.5675675.xyz/api/income/?owner=luo`

2. **JSON 数据键名国际化** (2025-04-12)
   - 中文键名改为英文键名
   - 使用翻译对象保持中文显示
   - 实现过程：
     - 定义 `keyTranslations` 和 `fieldTranslations` 映射对象
     - 更新数据处理逻辑使用新的英文键名
     - 在 UI 展示时转换为中文显示

3. **日期格式化与数据处理** (2025-04-12)
   - 添加 `formatTime` 函数将 ISO 时间格式 `2025-02-28T16:00:00.000Z` 转换为 `yyyy-MM` 格式
   - 排序处理：将接口返回的倒序数据转为正序显示
   - 优化表格组件 `JsonToTable`
     - 支持字段过滤 (排除 id、owner、createdAt、updatedAt)
     - 支持字段名翻译
     - 数值格式化

### 完整实现流程

1. **API 数据加载**

   ```typescript
   // 原始UMD加载方式
   await loadScript(url)
   localStorage.setItem(globalName, JSON.stringify(window[globalName]))

   // 改为API请求方式
   const response = await fetch(url)
   if (!response.ok)
     throw new Error(`HTTP error! status: ${response.status}`)

   const data = await response.json()
   localStorage.setItem(globalName, JSON.stringify(data))
   ```

2. **键名国际化处理**

   ```typescript
   // 定义键名映射
   const keyTranslations = {
     totalIncomeBeforeTax: '至今税前总收入',
     totalExpenses: '至今税金房租总支出',
     // ... 其他键名映射
   }

   const fieldTranslations = {
     baseSalary: '基本工资',
     overtimeMeal: '加班餐补',
     // ... 其他字段映射
   }
   ```

3. **日期格式化**

   ```typescript
   function formatTime(isoTime: string): string {
     const date = new Date(isoTime)
     const year = date.getFullYear()
     const month = String(date.getMonth() + 1).padStart(2, '0')
     return `${year}-${month}`
   }
   ```

4. **数据排序**

   ```typescript
   // 将数据按时间正序排序
   const sortedData = [...odata].sort((a, b) =>
     new Date(a.time).getTime() - new Date(b.time).getTime()
   )
   ```

## todo

- [x] feat: 进度数据缓存

- [ ] feat: 进度缓存有效期 3 天，过期强制从头开始背

- [x] feat: ios 双击放大问题 - button 元素双击问题，不使用 button

- [ ] feat: N3 单词库数据生成

- [ ] feat: toast、烟花动画

- [ ] feat: 白板根据罗马音 / 听默写功能

- [ ] feat: 手势功能

- [ ] feat: 虚拟键盘

- [x] dev: 数据来源 OSS 改为 API

- [x] dev: 添加 JSON 键名国际化支持

- [x] dev: 添加日期格式化和数据排序功能

- [ ] dev: pwa 缓存

- [ ] dev: 静态资源来源 OSS

- [x] dev: 使用 pwa 缓存静态资源
