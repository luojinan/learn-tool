<script setup lang="ts">
import { useFetch } from '@vueuse/core';
import { useRouteQuery } from '@vueuse/router';
import markdownit from 'https://esm.sh/markdown-it';

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