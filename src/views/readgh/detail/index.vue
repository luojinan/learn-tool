<script setup lang="ts">
import { useFetch } from '@vueuse/core';
import { useRouteQuery } from '@vueuse/router';
import markdownit from 'https://esm.sh/markdown-it@14.0.0';
// import markdownit from 'https://registry.npmmirror.com/markdown-it/14.0.0/files';
// import markdownit from 'https://registry.npmmirror.com/markdown-it/14.0.0/files//dist/markdown-it.min.js';
// https://esm.sh/markdown-it@14.0.0

// esm 稍微有点慢，尝试使用cnpm，但是发现markdown-it产物mjs内部使用了裸引用
// 猜测markdown-it的mjs产物专供本地构建工具使用
// 强制本地安装前置依赖
// 但是在esmsh会成功把前置依赖的裸引用转为esmsh地址，cnpm连这点小事的都不做？
// ❌ esmsh 可以处理裸引用是因为加载的是github文件
// 应该拿cnpm 和 unpkg对比，这类加载npm产物的cdn适用umd形式使用，而不是esm形式因为大部分npm产物的mjs都是给本地构建工具用的
// 如 [通过 CDN 使用 Vue](https://cn.vuejs.org/guide/quick-start.html#using-vue-from-cdn)

// 继续使用esmsh 尝试 1. 通过构建工具让加载加快 2. 使用预加载，在文章列表页选文章的空闲时间加载

import { onMounted, ref } from 'vue';

const ignoreText1 = '**CDS收藏：** [公民馆](https://chinadigitaltimes.net/space/%E5%85%AC%E6%B0%91%E9%A6%86)'
const ignoreText2 = '**版权说明：** 该作品版权归原作者所有。中国数字时代仅对原作进行存档，以对抗中国的网络审查。[详细版权说明](https://chinadigitaltimes.net/chinese/copyright)。'

const action = useRouteQuery('action')
const md = markdownit()

const isLoading = ref(true)

const init = async () => {
  const { data } = await useFetch(action.value).text()
  const result = md.render(data.value.replace(/!\[(.*?)\]\((.*?)\)/g, '').replace(ignoreText1,'').replace(ignoreText2, ''))
  const container = document.getElementById("container");
  container.innerHTML = result;
  isLoading.value = false
}

onMounted(() => {
  init()
})
</script>

<template>
  <div v-show="isLoading" class="mt-50 text-center text-white">loading...</div>
  <div id="container" class="px-2 pb-6"></div>
</template>