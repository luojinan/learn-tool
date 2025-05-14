interface RandomInfo {
  remainingValues: any[] // 剩余未获取
  obtainedValues: any[] // 已获取
  currentIndex: number
}

// 从对象内字段剩余项目数组中随机取1项，并设置进字段已获取数组
export function getRandomItem(info: RandomInfo) {
  const { remainingValues, obtainedValues } = info
  const randomIndex = Math.floor(Math.random() * remainingValues.length)
  const item = remainingValues[randomIndex]
  remainingValues.splice(randomIndex, 1)
  obtainedValues.push(item)
  // item.currentIndex = obtainedValues.length - 1
  Object.assign(info, { currentIndex: obtainedValues.length - 1 })
  // console.log(info,randomIndex)
}

// 使用ts加载umd的cdn资源
export function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = () => {
      resolve()
    }
    script.onerror = (error) => {
      reject(error)
    }
    document.body.appendChild(script)
  })
}

export async function cacheDataOrUmd(globalName: string, url: string) {
  const cacheData = localStorage.getItem(globalName)
  if (cacheData) {
    return Promise.resolve({
      data: JSON.parse(cacheData),
      msg: '来源缓存',
    })
  }
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    localStorage.setItem(globalName, JSON.stringify(data))
    return Promise.resolve({
      data,
      msg: '来源网络',
    })
  } catch (error) {
    return Promise.reject(error)
  }
}

// 使用ts加载一个esm的cdn资源-会跨域
// 创建一个工具函数用于通过<script>标签加载CDN上的ES模块并解决跨域问题
export function loadCdnEsmModule(
  url: string,
  globalVariableName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 创建一个新的script元素
    const script = document.createElement('script')
    script.type = 'module'

    script.onload = () => {
      // 如果模块导出了default属性，则将default属性或整个模块对象赋值给全局变量
      ; (window as any)[globalVariableName] =
        window[globalVariableName]?.default || window[globalVariableName]
      console.log(`${globalVariableName} loaded successfully`)
      resolve()
    }
    script.onerror = (error) => {
      console.error(`Failed to load CDN module from ${url}:`, error)
      reject(error)
    }

    // 将src属性设置为CDN资源地址，并将脚本添加到文档中以开始加载
    script.src = url
    document.head.appendChild(script)
  })
}

export function copyToClipboard(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  const successful = document.execCommand('copy')
  document.body.removeChild(textarea)
  return successful
}
