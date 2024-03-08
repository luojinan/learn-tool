<script setup lang="ts">
// TODO: 按文件大小排序，以及持久化缓存hook 目前是全局变量刷新/休眠即丢失
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ossDataUrl } from '@/common/const.js';
import { loadScript } from '@/common/utils.js';
const router = useRouter();

const ghHost = 'https://raw.gitmirror.com/'
const url = 'tomyangsh/news-backup/master'

const ghurl = ref(`${ghHost}${url}`)

// 使用ts获取当前月份的前一个月，并格式化为YYYY-MM
function getMonth() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().slice(0, 7)
}
// 月份选择器
const month = ref(getMonth())

const datalist = ref([])

const getList = async () => {
  const dataPath = `ghnew-${month.value}`
  if(!window[dataPath]){
    const dataUrl = `${ossDataUrl}/${dataPath}.js`
    await loadScript(dataUrl, dataPath)
  }
  datalist.value = window[dataPath]
}

const toDetail = (item) => {
  const action = encodeURIComponent(`${ghurl.value}/${month.value}/${item}`)
  router.push(`/readgh/detail?action=${action}`)
}
</script>

<template>
  <div class="flex-col">
    <div>
      <div class="i-logos-github-icon?mask text-red-300 text-3xl" /><input class="w-90vw" v-model="ghurl">
    </div>
    <div><input type="month" v-model="month" /></div>
    <button @click="getList">获取</button>
    <div class="my-2" v-for="(item, index) in datalist" :key="index" @click="toDetail(item.title)">
      {{ index + 1 }}、{{ item.title }}({{ item.size }}b)
    </div>
  </div>
</template>