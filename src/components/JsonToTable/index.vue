<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CDN_ESM_HTML_TO_IMAGE } from '@/common/const'
import { loadScript } from '@/common/utils'

const { incomeDataList } = defineProps<Props>()
const headers = ref<string[]>([])
const rows = ref([])
interface Props {
  incomeDataList: any[]
}

const isShowToast = ref(false)

// 解析 JSON 数据，获取表头和行数据
function parseJsonData() {
  const lengthList = incomeDataList.map((item) => {
    const labelList = Object.keys(item)
    return labelList.length
  })
  // 找出数组中最大项的index
  const maxLength = Math.max(...lengthList)
  const index = lengthList.findIndex(item => item === maxLength)
  headers.value = Object.keys(incomeDataList[index])
  rows.value = incomeDataList.map((item) => {
    return headers.value.reduce((res, next) => {
      res[next] = item[next] || '-'
      return res
    }, {})
  })
}

// 导出表格为图片
async function exportImage() {
  const table = document.querySelector('table')

  if (!window.htmlToImage)
    await loadScript(CDN_ESM_HTML_TO_IMAGE)

  const dataUrl = await htmlToImage.toPng(table)

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${incomeDataList[0].time}-${incomeDataList[incomeDataList.length - 1].time}.png`

  link.click()
}

// 导出表格为 Markdown
function exportMarkdown() {
  let markdown = `| ${headers.value.join(' | ')} |\n`
  markdown += `| ${headers.value.map(() => '---').join(' | ')} |\n`

  rows.value.forEach((row) => {
    const values = Object.values(row)
    markdown += `| ${values.join(' | ')} |\n`
  })
  // 复制
  navigator.clipboard.writeText(markdown)
  isShowToast.value = true
  setTimeout(() => {
    isShowToast.value = false
  }, 2000)
}

onMounted(() => {
  parseJsonData()
})
</script>

<template>
  <div class="flex justify-end">
    <button class="btn btn-sm mr-2" @click="exportMarkdown">
      复制md
    </button>
    <button class="btn btn-sm btn-primary mr-2" @click="exportImage">
      下载图片
    </button>
  </div>
  <div class="overflow-x-auto mb-4">
    <table class="table" style="background-color: #141414;">
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index" class="border-solid border-slate-700">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td v-for="(value, key) in row" :key="key" class="border-solid text-white border-slate-700 px-2 text-center">
            {{
              value.toLocaleString() }}
          </td>
        </tr>
      </tbody>
      <!-- foot -->
      <tfoot>
        <tr>
          <th v-for="(header, index) in headers" :key="index" class="border-solid border-slate-700">
            {{ header }}
          </th>
        </tr>
      </tfoot>
    </table>
  </div>
  <div v-show="isShowToast" class="toast toast-center">
    <div class="alert alert-success">
      <span>✨ 复制成功</span>
    </div>
  </div>
</template>
