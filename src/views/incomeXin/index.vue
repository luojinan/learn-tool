<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { CDN_UMD_ANTV, ossDataUrl } from '@/common/const'
import { cacheDataOrUmd, loadScript } from '@/common/utils'
import JsonToTable from '@/components/JsonToTable/index.vue'

interface DataItem {
  time: string
  value: number
  type: string
}

// 遍历对象，并且数字类型的值累加
function sumObj(obj: any) {
  let sum = 0
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'number')
        sum += Math.round(obj[key] * 100)
    }
  }
  return sum / 100
}

function sumNumArr(list: number[]): number {
  const total = list.reduce((pre, next) => {
    return pre + Math.round(next * 100)
  }, 0)
  return total / 100
}

const totalRef = ref()
const lostRef = ref()
const inRef = ref()

interface TotalInfo {
  至今税前总收入?: number
  至今税金房租总支出?: number
  至今到手总收入?: number
  至今平均到手月入?: number
  预计税前年入?: number
  预计到手年入?: number
}

const totalInfo = ref<TotalInfo>({})

let area3 = null
function init(odata) {
  const realIncomeList = odata.map((item) => {
    return {
      time: item.time,
      value: sumObj(item),
      type: '实际收入',
    }
  })
  const lostList = odata.map((item) => {
    const list = Object.entries(item).filter(([_, val]) => val < 0)
    const loastRes = list.reduce((pre, [, nextVal]) => {
      return pre + nextVal
    }, 0)
    return {
      time: item.time,
      value: -loastRes,
      type: '硬性支出',
    }
  })
  const data = [...lostList, ...realIncomeList]
  totalInfo.value.至今到手总收入 = sumNumArr(realIncomeList.map(item => item.value))
  totalInfo.value.至今税前总收入 = totalInfo.value.至今到手总收入 + sumNumArr(lostList.map(item => item.value))
  totalInfo.value.至今税金房租总支出 = totalInfo.value.至今税前总收入 - totalInfo.value.至今到手总收入
  totalInfo.value.至今平均到手月入 = totalInfo.value.至今到手总收入 / odata.length
  totalInfo.value.预计到手年入 = totalInfo.value.至今平均到手月入 * 12
  totalInfo.value.预计税前年入 = (totalInfo.value.至今税前总收入 / odata.length) * 12

  if (area3) {
    area3.changeData(data)
    return
  }

  area3 = new G2Plot.Area(totalRef.value, {
    data,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    theme: 'dark',
    label: {
      callback: (text) => {
        if (+text > 5000)
          return { content: text }
      },
    },
    tooltip: {
      customItems: (originalItems) => {
        const res = originalItems.reduce((pre, next) => {
          return pre + +(next.value)
        }, 0)
        return [...originalItems, { name: '税前收入', value: res }]
      },
    },
  })
  area3.render()
}

let area1 = null
function initLostRef(odata) {
  const list: DataItem[] = []
  odata.forEach((element) => {
    Object.entries(element).sort((item, nextItem) => nextItem[1] - item[1]).forEach(([key, val]) => {
      if (typeof val === 'number' && val < 0) {
        list.push({
          time: element.time,
          value: -val,
          type: key,
        })
      }
    })
  })
  if (!area1) {
    area1 = new G2Plot.Area(lostRef.value, {
      data: list,
      xField: 'time',
      yField: 'value',
      theme: 'dark',
      seriesField: 'type',
      tooltip: {
        customItems: (originalItems) => {
          const res = originalItems.reduce((pre, next) => {
            return pre + +(next.value)
          }, 0)
          return [...originalItems, { name: '总支出', value: res }]
        },
      },
    })
    area1.render()
    return
  }
  area1.changeData(list)
}
let area2 = null
function initInRef(odata) {
  const list: DataItem[] = []
  odata.forEach((element) => {
    Object.entries(element).sort((item, nextItem) => item[1] - nextItem[1]).forEach(([key, val]) => {
      if (typeof val === 'number' && val >= 0) {
        list.push({
          time: element.time,
          value: val,
          type: key,
        })
      }
    })
  })
  // 数组的第一和第二项交换位置
  if (list.length > 1) {
    const first = list[0]
    list[0] = list[1]
    list[1] = first
  }
  if (area2) {
    area2.changeData(list)
    return
  }
  area2 = new G2Plot.Area(inRef.value, {
    data: list,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    theme: 'dark',
    yAxis: {
      min: 5000,
    },
    tooltip: {
      customItems: (originalItems) => {
        const res = originalItems.reduce((pre, next) => {
          return pre + +(next.value)
        }, 0)
        return [...originalItems, { name: '税前收入', value: res }]
      },
    },
  })
  area2.render()
}

const dataMsg = ref('')
const incomeDataList = ref([])

async function getIncomeData() {
  const dataPath = 'incomeDataXin'
  const dataName = 'incomeDataXinList'
  const dataUrl = `${ossDataUrl}/${dataPath}.js`
  const { data, msg } = await cacheDataOrUmd(dataName, dataUrl)
  dataMsg.value = msg
  incomeDataList.value = data
  return data
}

async function loadAntv() {
  if (window.G2Plot)
    return
  await loadScript(CDN_UMD_ANTV)
}

async function onCreated() {
  const [incomeDataList] = await Promise.all([getIncomeData(), loadAntv()])
  init(incomeDataList)
  initLostRef(incomeDataList)
  initInRef(incomeDataList)
}

function onRefresh() {
  const dataName = 'incomeDataXinList'
  localStorage.removeItem(dataName)
  onCreated()
}

onBeforeMount(() => {
  onCreated()
})
</script>

<template>
  <article class="prose max-w-full">
    <div class="text-right mr-2">
      {{ dataMsg }}
      <div class="btn btn-primary btn-square btn-sm" @click="onRefresh">
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M18.364 5.636L16.95 7.05A7 7 0 1 0 19 12h2a9 9 0 1 1-2.636-6.364" /></svg>
      </div>
    </div>
    <template v-if="incomeDataList.length">
      <h2 class="mt-1 text-center">
        {{ incomeDataList[0].time }}~{{ incomeDataList[incomeDataList.length - 1].time }} ({{ incomeDataList.length }})
      </h2>
      <ul>
        <li v-for="(val, key) in totalInfo" :key="key">
          {{ key }}：  <span class="text-primary font-bold">{{ val?.toLocaleString() }}</span>
        </li>
      </ul>
      <h3 class="px-2 text-center">
        到手情况
      </h3>
      <p class="px-2 font-size-3">
        收入包含提取公积金、补贴。支出包含五险一金、房租支出
      </p>
      <div ref="totalRef" />

      <h3 class="px-2 text-center">
        硬性支出情况
      </h3>
      <div ref="lostRef" />

      <h3 class="px-2 text-center">
        收入情况
      </h3>
      <p class="px-2 font-size-3">
        包含提取公积金、饭补
      </p>
      <div ref="inRef" />

      <h3 class="px-2 text-center">
        表格数据
      </h3>
      <JsonToTable v-if="incomeDataList.length" :income-data-list />
    </template>
  </article>
</template>
