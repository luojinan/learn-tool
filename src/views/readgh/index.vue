<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { list } from './data.js';
const router = useRouter();

const url = 'https://raw.gitmirror.com/tomyangsh/news-backup/master'

// 月份选择器
const ghurl = ref(url)
const month = ref('')
const datalist = ref([])
const getList = () => {
  console.log(ghurl.value, month.value)
  datalist.value = list
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
    <div class="my-2" v-for="(item, index) in datalist" :key="index" @click="toDetail(item)">
      {{ index + 1 }}、{{ item }}
    </div>
  </div>
</template>