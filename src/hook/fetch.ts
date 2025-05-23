import { createClient } from '@supabase/supabase-js'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { loadScript } from '@/common/utils'

/**
 * 使用UMD模块数据的缓存或重新获取。
 *
 * 此函数旨在提供一种策略，以决定是使用本地存储中的缓存数据，还是从指定的URL重新获取数据。
 *
 * @param globalName 显示指定UMD内使用的全局变量，用于在本地存储中存储缓存数据，以及在脚本加载后引用数据。
 * @param url umd资源的oss全路径
 * @returns 返回一个数组，包含数据引用、数据来源信息和重新获取数据的方法。
 */
export function useUmdDataCacheOrFetch<F>(
  globalName: string,
  url: string,
): [Ref<F | null>, string, () => Promise<void>] {
  // 初始化数据引用，用于存储最终的数据值。
  const data = ref(null)
  // 初始化数据来源信息引用，用于指示数据是来自缓存还是网络。
  const dataFromMsg = ref('')
  // 从本地存储尝试获取缓存数据。
  const cacheData = localStorage.getItem(globalName)

  // 检查是否有缓存数据可用。
  if (cacheData) {
    // 如果有缓存数据，解析并设置数据值，同时标记数据来源为缓存。
    data.value = JSON.parse(cacheData)
    dataFromMsg.value = '来源缓存'
  } else {
    // 如果没有缓存数据，加载脚本并尝试从URL获取数据。
    loadScript(url)
      .then(() => {
        // 脚本加载成功后，将数据存储到本地，并更新数据值和数据来源标记。
        localStorage.setItem(globalName, JSON.stringify(window[globalName]))
        data.value = window[globalName]
        dataFromMsg.value = '来源网络'
      })
      .catch((error) => {
        // 脚本加载失败时，记录错误。
        console.log(error)
      })
  }

  // 定义重新获取数据的方法。
  const reFetch = async () => {
    // 清除本地存储中的缓存数据，重置数据引用和数据来源标记。
    localStorage.removeItem(globalName)
    data.value = null
    dataFromMsg.value = ''
    try {
      // 重新加载脚本，并在成功后更新本地存储和数据引用。
      await loadScript(url)
      localStorage.setItem(globalName, JSON.stringify(window[globalName]))
      data.value = window[globalName]
      dataFromMsg.value = '来源网络'
    } catch (error) {
      // 加载失败时，记录错误。
      console.log(error)
    }
  }

  // 返回数据引用、数据来源信息引用和重新获取数据的方法。
  return [data, dataFromMsg, reFetch]
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
