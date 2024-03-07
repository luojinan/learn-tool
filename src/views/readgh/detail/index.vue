<script setup lang="ts">
import { useFetch } from '@vueuse/core';
import { useRouteQuery } from '@vueuse/router';
import markdownit from 'https://esm.sh/markdown-it';

import { onMounted, ref } from 'vue';

const action = useRouteQuery('action')
const md = markdownit()

const isLoading = ref(true)

// 拉取文件 目录，点击进入 渲染器
const init = async () => {
  const { isFetching, error, data } = await useFetch(action.value).text()
  const result = md.render(data.value);
  const container = document.getElementById("container");
  container.innerHTML = result;
  isLoading.value = isFetching.value
}

onMounted(() => {
  init()
})
</script>

<template>
  <div id="container"></div>
  <div class="mt-50 text-center text-white">{{ isLoading ? 'loading...' : '' }}</div>
</template>