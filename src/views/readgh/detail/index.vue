<script setup lang="ts">
import { useFetch } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { onMounted, ref } from 'vue'
import { loadScript } from '@/common/utils'

const ignoreText1 = '**CDS收藏：** [公民馆](https://chinadigitaltimes.net/space/%E5%85%AC%E6%B0%91%E9%A6%86)'
const ignoreText2 = '**版权说明：** 该作品版权归原作者所有。中国数字时代仅对原作进行存档，以对抗中国的网络审查。[详细版权说明](https://chinadigitaltimes.net/chinese/copyright)。'

const action = useRouteQuery<string>('action')
const isLoading = ref(true)

// esm 稍微有点慢，尝试使用cnpm，但是发现markdown-it产物mjs内部使用了裸引用
// markdown-it的mjs产物专供本地构建工具使用
// 应该拿cnpm 和 unpkg对比，这类加载npm产物的cdn适用umd形式使用，而不是esm形式因为大部分npm产物的mjs都是给本地构建工具用的
async function loadMdIt() {
  if (window.markdownit)
    return

  await loadScript('https://registry.npmmirror.com/markdown-it/14.0.0/files/dist/markdown-it.min.js')
}

async function getPostMdStr() {
  const { data } = await useFetch(action.value).text()
  if (!data.value) {
    const res = await useFetch(action.value.replace('gitmirror', 'githubusercontent')).text()
    return res.data
  }
  return data
}

async function init() {
  const [, data] = await Promise.all([loadMdIt(), getPostMdStr()])
  const md = window.markdownit!()
  const result = md.render(data?.value?.replace(/!\[(.*?)\]\((.*?)\)/g, '').replace(ignoreText1, '').replace(ignoreText2, ''))
  const container = document.getElementById('container')
  container!.innerHTML = result
  isLoading.value = false
}

onMounted(() => {
  init()
})
</script>

<template>
  <div v-show="isLoading" class="mt-10 text-center text-white">
    loading...
  </div>
  <article id="container" class="px-4 pb-4 prose" />
</template>
