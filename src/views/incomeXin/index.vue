<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import { CDN_UMD_ANTV, ossDataUrl } from '@/common/const'
import { cacheDataOrUmd, loadScript } from '@/common/utils'
import JsonToTable from '@/components/JsonToTable/index.vue'

// 响应式主题变量
const currentTheme = ref(localStorage.getItem('theme') || 'light')

// 获取当前主题的方法
function getCurrentTheme(): string {
  return document.documentElement.getAttribute('data-theme') || 'light'
}

interface DataItem {
  time: string
  value: number
  type: string
}

// Original IncomeXin JSON data structure
interface IncomeXinData {
  time: string
  基本工资: number
  绩效: number
  通讯费: number
  提取公积金: number
  误餐报销: number
  餐补: number
  交通报销: number
  公积金: number
  医疗保险: number
  养老保险: number
  失业保险: number
  扣税: number
  房租: number
  [key: string]: string | number
}

// API compatible structure (matches income page)
interface IncomeData {
  id?: string
  owner?: string
  time: string
  baseSalary: number
  overtimeMeal: number
  housingFund: number
  leaveDeduction?: number
  housingFundDeduction?: number
  medicalInsurance: number
  pensionInsurance: number
  unemploymentInsurance: number
  tax: number
  rent: number
  createdAt?: string
  updatedAt?: string
  [key: string]: string | number | undefined
}

// Field mappings from Chinese to English fields
const fieldMappings: Record<string, keyof IncomeData> = {
  基本工资: 'baseSalary',
  绩效: 'baseSalary', // 合并到基本工资
  通讯费: 'baseSalary', // 合并到基本工资
  误餐报销: 'overtimeMeal',
  餐补: 'overtimeMeal', // 合并到加班餐补
  交通报销: 'overtimeMeal', // 合并到加班餐补
  提取公积金: 'housingFund',
  公积金: 'housingFundDeduction',
  医疗保险: 'medicalInsurance',
  养老保险: 'pensionInsurance',
  失业保险: 'unemploymentInsurance',
  扣税: 'tax',
  房租: 'rent',
}

// Translations for field display (used by JsonToTable)
const fieldTranslations: Record<string, string> = {
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
  time: '时间',
  基本工资: '基本工资',
  绩效: '绩效',
  通讯费: '通讯费',
  提取公积金: '提取公积金',
  误餐报销: '误餐报销',
  餐补: '餐补',
  交通报销: '交通报销',
  公积金: '公积金扣款',
  医疗保险: '医疗保险',
  养老保险: '养老保险',
  失业保险: '失业保险',
  扣税: '个人所得税',
  房租: '房租',
}

// 定义表格显示字段及顺序
const displayFields = [
  'time', // 时间
  '基本工资', // 基本工资
  '绩效', // 绩效
  '通讯费', // 通讯费
  '提取公积金', // 提取公积金
  '误餐报销', // 误餐报销
  '餐补', // 餐补
  '交通报销', // 交通报销
  '公积金', // 公积金
  '医疗保险', // 医疗保险
  '养老保险', // 养老保险
  '失业保险', // 失业保险
  '扣税', // 扣税
  '房租', // 房租
]

// Translations for totalInfo keys
const keyTranslations: Record<string, string> = {
  totalIncomeBeforeTax: '至今税前总收入',
  totalExpenses: '至今税金房租总支出',
  totalIncomeAfterTax: '至今到手总收入',
  averageMonthlyIncome: '至今平均到手月入',
  estimatedAnnualIncomeBeforeTax: '预计税前年入',
  estimatedAnnualIncomeAfterTax: '预计到手年入',
}

// 遍历对象，并且数字类型的值累加
function sumObj(obj: any): number {
  let sum = 0
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      if (typeof obj[key] === 'number') sum += Math.round(obj[key] * 100)
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

// Format time to YYYY-MM format
function formatTime(time: string): string {
  // Handle format like "2023.12" or "2023-12"
  return time.replace('.', '-')
}

// Parse time string to Date object for sorting
function parseTimeString(timeStr: string): Date {
  // 对不同格式的时间字符串进行统一处理
  // 处理 "YYYY.MM", "YYYY-MM", "YYYY/MM" 或 "YYYY.MM.DD", "YYYY-MM-DD", "YYYY/MM/DD" 格式
  const formattedStr = timeStr.replace(/[.\-/]/g, '-')

  // 如果只有年月格式 (YYYY-MM)，则添加日（默认为1日）
  if (formattedStr.match(/^\d{4}-\d{1,2}$/)) {
    return new Date(`${formattedStr}-01`)
  }

  // 如果是完整的年月日格式
  return new Date(formattedStr)
}

const totalRef = ref<HTMLElement | null>(null)
const lostRef = ref<HTMLElement | null>(null)
const inRef = ref<HTMLElement | null>(null)

interface TotalInfo {
  totalIncomeBeforeTax?: number
  totalExpenses?: number
  totalIncomeAfterTax?: number
  averageMonthlyIncome?: number
  estimatedAnnualIncomeBeforeTax?: number
  estimatedAnnualIncomeAfterTax?: number
}

const totalInfo = ref<TotalInfo>({})

// Transform IncomeXinData to IncomeData format
function transformData(data: IncomeXinData[]): IncomeData[] {
  return data.map((item) => {
    // 创建基本结构，保留API需要的字段结构
    const result: IncomeData = {
      time: item.time,
      baseSalary: (item.基本工资 || 0) + (item.绩效 || 0) + (item.通讯费 || 0),
      overtimeMeal:
        (item.误餐报销 || 0) + (item.餐补 || 0) + (item.交通报销 || 0),
      housingFund: item.提取公积金 || 0,
      housingFundDeduction: item.公积金 || 0,
      medicalInsurance: item.医疗保险 || 0,
      pensionInsurance: item.养老保险 || 0,
      unemploymentInsurance: item.失业保险 || 0,
      tax: item.扣税 || 0,
      rent: item.房租 || 0,
    }

    // 同时保留所有原始字段
    Object.entries(item).forEach(([key, value]) => {
      if (key !== 'time') {
        // 使用原始字段名作为属性名
        result[key] = value
      }
    })

    return result
  })
}

let area3: any = null
function init(odata: IncomeXinData[]) {
  const realIncomeList = odata.map((item) => {
    return {
      time: item.time,
      value: sumObj(item),
      type: '实际收入',
    }
  })
  const lostList = odata.map((item) => {
    const list = Object.entries(item).filter(
      ([_, val]) => typeof val === 'number' && val < 0,
    )
    const loastRes = list.reduce((pre, [, nextVal]) => {
      return pre + (nextVal as number)
    }, 0)
    return {
      time: item.time,
      value: -loastRes,
      type: '硬性支出',
    }
  })
  const data = [...lostList, ...realIncomeList]
  totalInfo.value.totalIncomeAfterTax = sumNumArr(
    realIncomeList.map((item) => item.value),
  )
  totalInfo.value.totalIncomeBeforeTax =
    totalInfo.value.totalIncomeAfterTax +
    sumNumArr(lostList.map((item) => item.value))
  totalInfo.value.totalExpenses =
    totalInfo.value.totalIncomeBeforeTax - totalInfo.value.totalIncomeAfterTax
  totalInfo.value.averageMonthlyIncome =
    totalInfo.value.totalIncomeAfterTax / odata.length
  totalInfo.value.estimatedAnnualIncomeAfterTax =
    totalInfo.value.averageMonthlyIncome * 12
  totalInfo.value.estimatedAnnualIncomeBeforeTax =
    (totalInfo.value.totalIncomeBeforeTax / odata.length) * 12

  if (area3) {
    area3.changeData(data)
    return
  }

  if (typeof window.G2Plot !== 'undefined') {
    area3 = new window.G2Plot.Area(totalRef.value, {
      data,
      xField: 'time',
      yField: 'value',
      seriesField: 'type',
      theme: currentTheme.value,
      label: {
        callback: (text: string) => {
          if (+text > 5000) return { content: text }
          return null
        },
      },
      tooltip: {
        customItems: (originalItems: any[]) => {
          const res = originalItems.reduce((pre: number, next: any) => {
            return pre + +next.value
          }, 0)
          return [...originalItems, { name: '税前收入', value: res }]
        },
      },
    })
    area3.render()
  }
}

let area1: any = null
function initLostRef(odata: IncomeXinData[]) {
  const list: DataItem[] = []
  odata.forEach((element) => {
    Object.entries(element)
      .sort(([, val1], [, val2]) => {
        const v1 = typeof val1 === 'number' ? val1 : 0
        const v2 = typeof val2 === 'number' ? val2 : 0
        return v2 - v1
      })
      .forEach(([key, val]) => {
        if (typeof val === 'number' && val < 0) {
          list.push({
            time: element.time,
            value: -val,
            type: key,
          })
        }
      })
  })
  if (!area1 && typeof window.G2Plot !== 'undefined') {
    area1 = new window.G2Plot.Area(lostRef.value, {
      data: list,
      xField: 'time',
      yField: 'value',
      theme: currentTheme.value,
      seriesField: 'type',
      tooltip: {
        customItems: (originalItems: any[]) => {
          const res = originalItems.reduce((pre: number, next: any) => {
            return pre + +next.value
          }, 0)
          return [...originalItems, { name: '总支出', value: res }]
        },
      },
    })
    area1.render()
    return
  }
  if (area1) {
    area1.changeData(list)
  }
}

let area2: any = null
function initInRef(odata: IncomeXinData[]) {
  const list: DataItem[] = []
  odata.forEach((element) => {
    Object.entries(element)
      .sort(([, val1], [, val2]) => {
        const v1 = typeof val1 === 'number' ? val1 : 0
        const v2 = typeof val2 === 'number' ? val2 : 0
        return v1 - v2
      })
      .forEach(([key, val]) => {
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
  if (area2 && area2.changeData) {
    area2.changeData(list)
    return
  }
  if (typeof window.G2Plot !== 'undefined') {
    area2 = new window.G2Plot.Area(inRef.value, {
      data: list,
      xField: 'time',
      yField: 'value',
      seriesField: 'type',
      theme: currentTheme.value,
      yAxis: {
        min: 5000,
      },
      tooltip: {
        customItems: (originalItems: any[]) => {
          const res = originalItems.reduce((pre: number, next: any) => {
            return pre + +next.value
          }, 0)
          return [...originalItems, { name: '税前收入', value: res }]
        },
      },
    })
    area2.render()
  }
}

const dataMsg = ref('')
const incomeDataList = ref<IncomeXinData[]>([])
const transformedDataList = ref<IncomeData[]>([])

// 准备表格数据
function prepareTableData(data: IncomeData[]): any[] {
  // 先对数据进行时间倒序排序（新日期在前）
  const sortedData = [...data].sort((a, b) => {
    const dateA = parseTimeString(a.time as string)
    const dateB = parseTimeString(b.time as string)
    return dateB.getTime() - dateA.getTime() // 倒序排列，新日期在前
  })

  return sortedData.map((item) => {
    // 创建一个只包含我们想要显示字段的新对象
    const tableItem: Record<string, any> = {}

    // 按照displayFields中定义的顺序添加字段
    displayFields.forEach((field) => {
      if (field === 'time') {
        // 时间字段需要格式化
        tableItem[field] = formatTime(item[field] as string)
      } else if (field in item) {
        // 只添加数据中存在的字段
        tableItem[field] = item[field]
      }
    })

    return tableItem
  })
}

async function getIncomeData() {
  const dataPath = 'incomeDataXin'
  const dataName = 'incomeDataXinList'
  const dataUrl = `${ossDataUrl}/${dataPath}.js`
  const { data, msg } = await cacheDataOrUmd(dataName, dataUrl)
  dataMsg.value = msg
  incomeDataList.value = data
  transformedDataList.value = transformData(data)
  return data
}

async function loadAntv() {
  if (window.G2Plot) return
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

// Add window.G2Plot declaration for TypeScript
declare global {
  interface Window {
    G2Plot: any
  }
}

// 监听主题变化并更新图表
watch(currentTheme, (newTheme) => {
  // 只有在图表已经初始化的情况下才更新
  if (area3) {
    area3.update({ theme: newTheme })
  }
  if (area1) {
    area1.update({ theme: newTheme })
  }
  if (area2) {
    area2.update({ theme: newTheme })
  }
})

// 初始化主题监听
onMounted(() => {
  // 设置初始主题
  currentTheme.value = getCurrentTheme()

  // 监听主题变化
  const observer = new MutationObserver(() => {
    currentTheme.value = getCurrentTheme()
  })

  // 观察 html 元素的 data-theme 属性变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
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
          {{ keyTranslations[key as keyof typeof keyTranslations] || key }}：<span class="text-primary font-bold">{{ val?.toLocaleString() }}</span>
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
      <JsonToTable 
        v-if="transformedDataList.length"
        :income-data-list="prepareTableData(transformedDataList)"
        :field-translations="fieldTranslations"
      />
    </template>
  </article>
</template>
