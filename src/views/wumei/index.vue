<script setup lang="ts">
import { onMounted, ref } from 'vue';
const WUMEI_URL = 'https://book.yunzhan365.com/kpoyq/uipu/mobile/javascript/config.js'

const list = ref([])

const init = async () => {
  const res = await fetch(WUMEI_URL).then(r => r.text())
  list.value = JSON.parse(res.split('"fliphtml5_pages":')[1].split(',"loadingConfig')[0])
}

onMounted(() => {
  init()
})
</script>

<template>
  <div>
    <h3 class="text-center">物美传单</h3>
    <img width="50%" v-for="(item, index) in list" :key="index" :src="`https://book.yunzhan365.com/kpoyq/uipu/files/large/${item.n[0]}?x-oss-process=image/resize,h_1272,w_828/sharpen,70`" alt="">
  </div>
</template>