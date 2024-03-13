<script lang="ts" setup>
import { useRouter } from 'vue-router';
const entryList = [
  {
    name: 'jap50yin',
    title: '读',
    desc: '五十音/单词',
    path: '/jap50yin',
  },
  {
    name: 'jap50yin',
    title: '写',
    desc: '五十音/单词',
    path: '/write',
  },
  {
    name: 'income',
    title: '💰 income',
    desc: '图表数据',
    path: '/income',
  },
  {
    name: 'readgh',
    title: '📖 404 post',
    desc: '文章阅读',
    path: '/readgh',
  },
]
const router = useRouter()

const go = (item: any) => {
  router.push(item.path)
}

</script>

<template>
  <div class="py-2 px-2 grip-layout">
    <div v-for="(item, index) in entryList" :key="index">
      <div class="btn flex-col" @click="go(item)">
        <div>{{ item.title }}</div>
        <div class="font-size-3">{{ item.desc}}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grip-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
}
</style>