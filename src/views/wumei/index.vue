<script setup lang="ts">
import { onMounted, ref } from 'vue'

const WUMEI_URL = 'https://book.yunzhan365.com/kpoyq/uipu/mobile/javascript/config.js'

const list = ref([])

async function init() {
  const res = await fetch(WUMEI_URL).then(r => r.text())
  list.value = JSON.parse(res.split('"fliphtml5_pages":')[1].split(',"search_pages')[0])
}

onMounted(() => {
  init()
})
</script>

<template>
  <div>
    <h3 class="text-center">
      物美传单
    </h3>
    <a href="https://book.yunzhan365.com/kpoyq/uipu" target="_blank" class="link link-primary block">https://book.yunzhan365.com/kpoyq/uipu</a>
    <img v-for="(item, index) in list" :key="index" class="inline-block" width="50%" :src="`https://book.yunzhan365.com/kpoyq/uipu/files/large/${item.n[0].split('/large/')[1]}`" alt="">
  </div>
</template>
