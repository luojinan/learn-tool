<script lang="ts" setup>
import { useRouter } from 'vue-router'
// TODO: 从路由配置中读取
// 动态路由目录生成
const entryList = [
  {
    name: 'income',
    title: '💰 income',
    desc: '图表数据',
    path: '/income',
  },
  {
    name: 'incomeXin',
    title: '💰 incomeXin',
    desc: '图表数据',
    path: '/incomeXin',
  },
  {
    name: 'book',
    title: '📚 book',
    desc: '拥有图书',
    path: '/book',
  },
]
const router = useRouter()

function go(item: any) {
  router.push(item.path)
}

// const weiboList = ref<Weibo[]>([])

// onMounted(() => {
//   // https://hot.imsyy.top/#/list?type=weibo&page=1
//   // fetch('https://weibo.com/ajax/side/hotSearch') // 😡 跨域
//   fetch('https://api-hot.imsyy.top/weibo?cache=true') // 😡 跨域
//     .then(r => r.json())
//     .then((res) => {
//       if (res.code === 200) {
//         weiboList.value = res.data.realtime.filter((item: Weibo) => {
//           return !(
//             /剧集|综艺|电影/.test(item?.flag_desc!)
//             || /肖战|易烊千玺|白鹿|华晨宇/.test(item.word)
//           )
//         })
//       }
//       else {
//         weiboList.value = [{ word: '加载失败' }]
//       }
//     })
//     .catch(() => {
//       weiboList.value = [{ word: '加载失败' }]
//     })
// })
</script>

<template>
  <div class="py-2 px-2 grip-layout">
    <div v-for="(item, index) in entryList" :key="index">
      <div class="w-full btn btn-primary flex-col" @click="go(item)">
        <div>{{ item.title }}</div>
        <div class="font-size-3">
          {{ item.desc }}
        </div>
      </div>
    </div>
  </div>
  <!-- <div v-if="!weiboList.length" class="text-center">
    loading weibo🔥 ...
  </div>
  <ul v-else class="mx-2 my-2 menu-md bg-base-200 divide-y divide-slate-700 rounded-box">
    <div
      v-for="(weibo, index) in weiboList"
      :key="index"
      class="py-3 px-2"
      @click="goout(weibo)"
    >
      {{ index + 1 }}、{{ weibo.word }}
    </div>
  </ul> -->
</template>

<style scoped>
.grip-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
}
</style>
