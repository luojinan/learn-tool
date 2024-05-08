<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
// TODO: 从路由配置中读取
// 动态路由目录生成
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
  {
    name: 'wumei',
    title: '🛍️ buy buy buy',
    desc: '物美传单',
    path: '/wumei',
  },
]
const router = useRouter()

const go = (item: any) => {
  router.push(item.path)
}

const goout = (item: Weibo) => {
  window.open(item.url)
}

interface Weibo { name: string; url?: string; hot?: string }

const weiboList = ref<Weibo[]>([])

onMounted(() => {
  fetch('https://tenapi.cn/v2/weibohot').then(r => r.json()).then(res => {
    if (res.code === 200) {
      weiboList.value = res.data.filter((item: Weibo) => {
        return !(/剧集|综艺|电影/.test(item.hot!) || /肖战|易烊千玺|白鹿|华晨宇/.test(item.name))
      })
    } else {
      weiboList.value = [{ name: '加载失败' }]
    }
  }).catch(()=>{
    weiboList.value = [{ name: '加载失败' }]
  })
})

</script>

<template>
  <div class="py-2 px-2 grip-layout">
    <div v-for="(item, index) in entryList" :key="index">
      <div class="w-full btn btn-primary flex-col" @click="go(item)">
        <div>{{ item.title }}</div>
        <div class="font-size-3">{{ item.desc }}</div>
      </div>
    </div>
  </div>
  <div v-if="!weiboList.length">loading weibo🔥</div>
  <ul v-else class="mx-2 my-2 menu-md bg-base-200 rounded-box">
  <div class="py-2 px-2" v-for="(weibo, index) in weiboList" :key="index" @click="goout(weibo)"> {{index+1}}、{{ weibo.name }}</div>
</ul>

</template>

<style scoped>
.grip-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
}
</style>