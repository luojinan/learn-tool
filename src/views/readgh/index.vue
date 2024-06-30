<script setup lang="ts">
// TODO: 按文件大小排序，以及持久化缓存hook 目前是全局变量刷新/休眠即丢失
import { useStorage } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cacheDataOrUmd } from '@/common/utils.js'
import { ossDataUrl } from '@/common/const.js'

const router = useRouter()

const ghHost = 'https://mirror.ghproxy.com/https://raw.githubusercontent.com/'
const url = 'tomyangsh/news-backup/master'

const ghurl = ref(`${ghHost}${url}`)

// 使用ts获取当前月份的前一个月，并格式化为YYYY-MM
function getMonth() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().slice(0, 7)
}
// 月份选择器

const cacheMonth = useStorage('readgh-month', '')

const month = ref(cacheMonth.value || getMonth())

interface PostItem {
  title: string
  size: number
  name: string
  from: string
  id: number
}

const datalist = ref<PostItem[]>([])
const dataMsg = ref('')
const hasSize = computed(() => datalist.value[0]?.size)

async function getList() {
  const dataPath = `ghnew-${month.value}`
  const dataUrl = `${ossDataUrl}/${dataPath}.js`
  const { data, msg } = await cacheDataOrUmd(dataPath, dataUrl) as { data: PostItem[], msg: string }
  datalist.value = data.filter(({ title }) => !title.includes('每日一语')).map(({ title, size }, index) => {
    let from, name
    [from, name] = title.split('｜')
    if (!name) {
      [from, name] = title.split('】')
      from += '】'
    }
    return {
      id: index,
      from,
      name: name && name.replace('.md', ''),
      title,
      size: +(size / 1000).toFixed(2),
    }
  })
  dataMsg.value = msg
  cacheMonth.value = month.value
}

// 根据size大小排序对象数组
function sortList() {
  const newList = datalist.value.sort((a, b) => b.size - a.size)
  datalist.value = newList
}

function backList() {
  const newList = datalist.value.sort((a, b) => a.id - b.id)
  datalist.value = newList
}

onMounted(() => {
  getList()
})

function toDetail(item) {
  const action = encodeURIComponent(`${ghurl.value}/${month.value}/${item}`)
  router.push(`/readgh/detail?action=${action}`)
}
</script>

<template>
  <div class="flex-col px-2">
    {{ dataMsg }}
    <div class="px-4">
      <input v-model="ghurl" class="w-full">
    </div>
    <div class="my-4 flex justify-center">
      <input v-model="month" type="month">
    </div>
    <div class="flex place-content-evenly">
      <button class="btn btn-primary" @click="getList">
        获取
      </button>
      <button v-if="hasSize" class="btn btn-primary" @click="sortList">
        排序
      </button>
      <button v-if="hasSize" class="btn btn-primary" @click="backList">
        还原
      </button>
    </div>
    <div v-for="(item, index) in datalist" :key="item.id" class="my-2 bg-gray-9 p-2" @click="toDetail(item.title)">
      <p class="my-1">
        {{ index + 1 }}.  {{ item.name || '-' }}
      </p>
      <p class="text-gray-500 my-1 text-right text-sm">
        [{{ item.from || '-' }}] {{ item.size || '-' }}kb
      </p>
    </div>
  </div>
</template>
