<script setup lang="ts">
import { copyToClipboard } from '@/common/utils';
import html2canvas from 'https://registry.npmmirror.com/html2canvas/1.4.1/files/dist/html2canvas.esm.js';
import { onMounted, ref } from 'vue';

const headers = ref([])
const rows = ref([])

// 解析 JSON 数据，获取表头和行数据
const parseJsonData = () => {
  const lengthList = incomeDataList.map(item => {
    const labelList = Object.keys(item)
    return labelList.length
  })
  // 找出数组中最大项的index
  const maxLength = Math.max(...lengthList)
  const index = lengthList.findIndex(item => item === maxLength)
  headers.value = Object.keys(window.incomeDataList[index])
  rows.value = incomeDataList.map(item => {
    return headers.value.reduce((res, next) => {
      res[next] = item[next] || '-'
      return res
    }, {})
  })
}

// 导出表格为图片
const exportImage = () => {
  const table = document.querySelector('table')
  html2canvas(table).then(canvas => {
    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    
    link.download = `${incomeDataList[0].time}-${incomeDataList[incomeDataList.length-1].time}.png`
    link.click()
  })
}

// 导出表格为 Markdown
const exportMarkdown = () => {
  let markdown = '| ' + headers.value.join(' | ') + ' |\n'
  markdown += '| ' + headers.value.map(() => '---').join(' | ') + ' |\n'
  
  rows.value.forEach(row => {
    const values = Object.values(row)
    markdown += '| ' + values.join(' | ') + ' |\n'
  })
  copyToClipboard(markdown)
}

onMounted(() => {
  parseJsonData()
})
</script>

<template>
  <div class="flex flex-justify-end">
    <button @click="exportImage">下载图片</button>
    <button @click="exportMarkdown">复制md</button>
  </div>
  <div class="width-full p-4 overflow-auto">
    <table class="border-collapse border border-slate-500" style="background-color: #141414;color: rgba(255, 255, 255, 0.87);">
      <thead>
        <tr>
          <th class="border-solid border-slate-700" v-for="(header, index) in headers" :key="index">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td class="border-solid border-slate-700 px-2 text-center" v-for="(value, key) in row" :key="key">{{ value.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
