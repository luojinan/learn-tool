<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { CDN_UMD_ANTV } from '@/common/const'
import { cacheDataOrUmd, loadScript } from '@/common/utils'
import JsonToTable from '@/components/JsonToTable/index.vue'

interface DataItem {
  time: string
  value: number
  type: string
}

interface IncomeData {
  id: string
  owner: string
  time: string
  baseSalary: number
  overtimeMeal: number
  housingFund: number
  leaveDeduction: number
  housingFundDeduction: number
  medicalInsurance: number
  pensionInsurance: number
  unemploymentInsurance: number
  tax: number
  rent: number
  createdAt: string
  updatedAt: string
}

interface OtherIncomeItem {
  time: string
  yearEndBonus?: string
  yearEndBonusMonthly?: number
  taxRefund?: number
}

// 遍历对象，并且数字类型的值累加
function sumObj(obj: any) {
  let sum = 0
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'number')
        sum += obj[key]
    }
  }
  return sum
}

function sumNumArr(list: number[]): number {
  return list.reduce((pre, next) => {
    return pre + next
  }, 0)
}

const totalRef = ref()
const lostRef = ref()
const inRef = ref()

interface TotalInfo {
  totalIncomeBeforeTax?: number
  totalExpenses?: number
  totalIncomeAfterTax?: number
  averageMonthlyIncome?: number
  yearEndBonus?: number
  yearEndBonusMonthly?: number
  totalIncomeAfterYearEnd?: number
  averageMonthlyIncomeAfterYearEnd?: number
  estimatedAnnualIncomeBeforeTax?: number
  estimatedAnnualIncomeAfterTax?: number
  estimatedAnnualIncomeAfterYearEnd?: number
}

const totalInfo = ref<TotalInfo>({})

const keyTranslations = {
  totalIncomeBeforeTax: '至今税前总收入',
  totalExpenses: '至今税金房租总支出',
  totalIncomeAfterTax: '至今到手总收入',
  averageMonthlyIncome: '至今平均到手月入',
  yearEndBonus: '年终',
  yearEndBonusMonthly: '年终换算为月均',
  totalIncomeAfterYearEnd: '年终后到手总收入',
  averageMonthlyIncomeAfterYearEnd: '年终后平均到手月入',
  estimatedAnnualIncomeBeforeTax: '预计税前年入',
  estimatedAnnualIncomeAfterTax: '预计到手年入',
  estimatedAnnualIncomeAfterYearEnd: '年终后预计到手年入',
}

const fieldTranslations = {
  baseSalary: '基本工资',
  overtimeMeal: '加班餐补',
  housingFund: '公积金',
  leaveDeduction: '请假扣款',
  housingFundDeduction: '公积金扣款',
  medicalInsurance: '医疗保险',
  pensionInsurance: '养老保险',
  unemploymentInsurance: '失业保险',
  tax: '个人所得税',
  rent: '房租',
}

function formatTime(isoTime: string): string {
  const date = new Date(isoTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function init(odata: IncomeData[]) {
  // 将数据按时间正序排序
  const sortedData = [...odata].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  const realIncomeList = sortedData.map((item) => {
    return {
      time: formatTime(item.time),
      value: sumObj(item),
      type: '实际收入',
    }
  })
  const lostList = sortedData.map((item) => {
    const list = Object.entries(item).filter(([_, val]) => typeof val === 'number' && val < 0)
    const lostRes = list.reduce((pre, [, nextVal]) => {
      return pre + (nextVal as number)
    }, 0)
    return {
      time: formatTime(item.time),
      value: -lostRes,
      type: '硬性支出',
    }
  })
  const data = [...lostList, ...realIncomeList]

  totalInfo.value.totalIncomeAfterTax = sumNumArr(realIncomeList.map(item => item.value))
  totalInfo.value.totalIncomeBeforeTax = totalInfo.value.totalIncomeAfterTax + sumNumArr(lostList.map(item => item.value))
  totalInfo.value.totalExpenses = totalInfo.value.totalIncomeBeforeTax - totalInfo.value.totalIncomeAfterTax
  totalInfo.value.averageMonthlyIncome = totalInfo.value.totalIncomeAfterTax / odata.length
  totalInfo.value.estimatedAnnualIncomeAfterTax = totalInfo.value.averageMonthlyIncome * 12
  totalInfo.value.estimatedAnnualIncomeBeforeTax = (totalInfo.value.totalIncomeBeforeTax / odata.length) * 12

  const area = new G2Plot.Area(totalRef.value, {
    data,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    theme: 'dark',
    label: {
      callback: (text: string) => {
        if (+text > 10000)
          return { content: text }
      },
    },
    tooltip: {
      customItems: (originalItems: any[]) => {
        const res = originalItems.reduce((pre: number, next: any) => {
          return pre + +(next.value)
        }, 0)
        return [...originalItems, { name: '税前收入', value: res }]
      },
    },
  })
  area.render()
}

function initLostRef(odata: IncomeData[]) {
  // 将数据按时间正序排序
  const sortedData = [...odata].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  const list: DataItem[] = []
  sortedData.forEach((element) => {
    Object.entries(element)
      .filter(([key]) => !['id', 'owner', 'time', 'createdAt', 'updatedAt'].includes(key))
      .sort(([, val1], [, val2]) => (val2 as number) - (val1 as number))
      .forEach(([key, val]) => {
        if (typeof val === 'number' && val < 0) {
          list.push({
            time: formatTime(element.time),
            value: -val,
            type: fieldTranslations[key as keyof typeof fieldTranslations] || key,
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
  const area = new G2Plot.Area(lostRef.value, {
    data: list,
    xField: 'time',
    yField: 'value',
    theme: 'dark',
    seriesField: 'type',
    tooltip: {
      customItems: (originalItems: any[]) => {
        const res = originalItems.reduce((pre: number, next: any) => {
          return pre + +(next.value)
        }, 0)
        return [...originalItems, { name: '总支出', value: res }]
      },
    },
  })
  area.render()
}

function initInRef(odata: IncomeData[]) {
  // 将数据按时间正序排序
  const sortedData = [...odata].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  const list: DataItem[] = []
  sortedData.forEach((element) => {
    Object.entries(element)
      .filter(([key]) => !['id', 'owner', 'time', 'createdAt', 'updatedAt', 'leaveDeduction'].includes(key))
      .sort(([, val1], [, val2]) => (val1 as number) - (val2 as number))
      .forEach(([key, val]) => {
        if (typeof val === 'number' && val >= 0) {
          list.push({
            time: formatTime(element.time),
            value: val,
            type: fieldTranslations[key as keyof typeof fieldTranslations] || key,
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
  const area = new G2Plot.Area(inRef.value, {
    data: list,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    theme: 'dark',
    yAxis: {
      min: 20000,
    },
    tooltip: {
      customItems: (originalItems: any[]) => {
        const res = originalItems.reduce((pre: number, next: any) => {
          return pre + +(next.value)
        }, 0)
        return [...originalItems, { name: '税前收入', value: res }]
      },
    },
  })
  area.render()
}

const dataMsg = ref('')
const incomeDataList = ref<IncomeData[]>([])
const otherIncomeList = ref<OtherIncomeItem[]>([
  { time: '2024-1', yearEndBonus: '100', yearEndBonusMonthly: 4364.5 },
  { time: '2024-3', taxRefund: 875.16 },
])

async function getIncomeData() {
  const dataName = 'incomeDataList'
  const dataUrl = 'https://monkey.5675675.xyz/api/income/?owner=luo'
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
  const dataName = 'incomeDataList'
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
        {{ formatTime(incomeDataList[0].time) }}~{{ formatTime(incomeDataList[incomeDataList.length - 1].time) }} ({{ incomeDataList.length }})
      </h2>
      <ul>
        <li v-for="(val, key) in totalInfo" :key="key">
          {{ keyTranslations[key as keyof typeof keyTranslations] }}：<span class="text-primary font-bold">{{ val?.toLocaleString() }}</span>
        </li>
      </ul>
      <h3 class="text-center">
        1. 到手情况
      </h3>
      <p class="px-2 font-size-3">
        收入包含提取公积金、饭补。支出包含五险一金、房租支出
      </p>
      <div ref="totalRef" />

      <h3 class="text-center">
        2. 硬性支出情况
      </h3>
      <div ref="lostRef" />

      <h3 class="text-center">
        3. 收入情况
      </h3>
      <p class="px-2 font-size-3">
        包含提取公积金、饭补
      </p>
      <div ref="inRef" />

      <ul>
        <li v-for="(item, i) in otherIncomeList" :key="i">
          {{ item.time }}
          <template v-if="item.yearEndBonus">
            年终奖 {{ item.yearEndBonus }} 换算为月均 {{ item.yearEndBonusMonthly }}
          </template>
          <template v-if="item.taxRefund">
            退税 {{ item.taxRefund }}
          </template>
        </li>
      </ul>

      <h3 class="text-center">
        4. 表格数据
      </h3>
      <JsonToTable
        v-if="incomeDataList.length"
        :income-data-list="incomeDataList.map(item => ({
          ...item,
          time: formatTime(item.time),
        }))"
        :exclude-fields="['id', 'owner', 'createdAt', 'updatedAt']"
        :field-translations="fieldTranslations"
      />
    </template>
  </article>
</template>
