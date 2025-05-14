<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { cacheDataOrUmd } from '@/common/utils'
import DateRangeFilter from '@/components/work-visualization/DateRangeFilter.vue'
import MonthlyWorkHours from '@/components/work-visualization/MonthlyWorkHours.vue'
import ProjectFilter from '@/components/work-visualization/ProjectFilter.vue'
import ProjectHoursDistribution from '@/components/work-visualization/ProjectHoursDistribution.vue'
import WorkHoursTrend from '@/components/work-visualization/WorkHoursTrend.vue'
import type { FilterState, WorkData } from '@/types/work-visualization'

// 数据加载和处理相关状态
const isLoading = ref(true)
const dataMsg = ref('')
// 初始化数据和状态
const workData = ref<WorkData[]>([])

// 筛选状态
const filters = ref<FilterState>({
  startDate: null,
  endDate: null,
  selectedProjects: [],
  aggregation: 'day', // 默认按天聚合
})

// 计算默认日期范围：最新数据的近半年，开始日期为1号
function calculateDefaultDateRange(sortedData: WorkData[]): {
  startDate: number
  endDate: number
} {
  // 获取最新数据的日期作为结束日期
  const latestData = sortedData[sortedData.length - 1]
  const endDate = latestData.timestamp

  // 计算半年前的日期
  const startDateObj = new Date(endDate)
  startDateObj.setMonth(startDateObj.getMonth() - 6) // 往前推6个月

  // 将开始日期设置为当月的1号
  startDateObj.setDate(1)
  startDateObj.setHours(0, 0, 0, 0)

  return {
    startDate: startDateObj.getTime(),
    endDate: endDate,
  }
}

// 选择所有日期范围
function selectAllDates() {
  if (workData.value.length > 0) {
    // 按时间戳排序
    const sortedData = [...workData.value].sort(
      (a, b) => a.timestamp - b.timestamp,
    )

    // 获取最早和最晚的日期
    const earliestDate = sortedData[0].timestamp
    const latestDate = sortedData[sortedData.length - 1].timestamp

    // 更新筛选状态
    filters.value.startDate = earliestDate
    filters.value.endDate = latestDate
  }
}

// 计算所有可用项目
const availableProjects = computed(() => {
  const projects = new Set<string>()
  workData.value.forEach((item: WorkData) => {
    if (item.project) projects.add(item.project)
  })
  return Array.from(projects)
})

// 基于筛选条件过滤数据
const filteredData = computed(() => {
  return workData.value.filter((item: WorkData) => {
    // 日期范围筛选（使用时间戳）
    const isInDateRange =
      (!filters.value.startDate || item.timestamp >= filters.value.startDate) &&
      (!filters.value.endDate || item.timestamp <= filters.value.endDate)

    // 项目筛选
    const isProjectSelected =
      filters.value.selectedProjects.length === 0 ||
      filters.value.selectedProjects.includes(item.project)

    return isInDateRange && isProjectSelected
  })
})

// 计算总工时和总收入
const totalStats = computed(() => {
  // 计算总工时
  const totalHours = filteredData.value.reduce(
    (sum, item) => sum + item.hours,
    0,
  )

  // 计算总收入（单价为62.5）
  const hourlyRate = 62.5
  const totalIncome = totalHours * hourlyRate

  return {
    hours: totalHours.toFixed(1), // 保留一位小数
    income: totalIncome.toFixed(2), // 保留两位小数
  }
})

// 加载JSON数据
async function loadWorkData() {
  try {
    isLoading.value = true
    const dataName = 'workDataList'
    const dataUrl = 'https://monkey.5675675.xyz/api/part-time'
    const { data, msg } = await cacheDataOrUmd(dataName, dataUrl)
    dataMsg.value = msg
    workData.value = data

    // 初始化日期范围为全部数据的范围
    if (data.length > 0) {
      // 按时间戳排序
      const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)

      // 如果还没有设置日期范围，则使用数据的范围
      if (!filters.value.startDate && !filters.value.endDate) {
        const defaultRange = calculateDefaultDateRange(sortedData)
        filters.value.startDate = defaultRange.startDate
        filters.value.endDate = defaultRange.endDate
      }
    }
  } catch (error) {
    console.error('加载工时数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 处理日期范围变更
function handleDateRangeChange(range: {
  start: number | null
  end: number | null
}) {
  filters.value.startDate = range.start
  filters.value.endDate = range.end
}

// 处理项目选择变更
function handleProjectsChange(projects: string[]) {
  filters.value.selectedProjects = projects
}

// 组件挂载时加载数据
onMounted(() => {
  loadWorkData()
})

// 刷新数据，清除缓存并重新加载
function refreshWorkData() {
  const dataName = 'workDataList'
  localStorage.removeItem(dataName)
  loadWorkData()
}
</script>

<template>
  <div class="work-visualization-container p-4">
    <div class="text-right mr-2">
      {{ dataMsg }}
      <div class="btn btn-primary btn-square btn-sm" @click="refreshWorkData">
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M18.364 5.636L16.95 7.05A7 7 0 1 0 19 12h2a9 9 0 1 1-2.636-6.364" /></svg>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container flex justify-center items-center py-8">
      <div class="loading">
        加载中...
      </div>
    </div>
    
    <template v-else>
      <!-- 全局筛选器 -->
      <div class="filters-container mb-8 p-4 bg-base-200 rounded-lg shadow-sm">
        <h2 class="text-lg font-semibold mb-4">
          筛选条件
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 日期范围选择器 -->
          <DateRangeFilter
            :start-date="filters.startDate"
            :end-date="filters.endDate"
            :all-dates-available="!isLoading && workData.length > 0"
            @update:date-range="handleDateRangeChange"
            @select-all-dates="selectAllDates"
          />

          <!-- 项目选择器 -->
          <ProjectFilter
            :available-projects="availableProjects"
            :selected-projects="filters.selectedProjects"
            @update:selected-projects="handleProjectsChange"
          />
        </div>
      </div>

      <!-- 总工时和收入统计 -->
      <div class="stats-container mb-8 p-4 bg-base-100 rounded-lg shadow">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="stat-card p-4 bg-base-100 rounded-lg border-l-4 border-primary">
            <div class="stat-title text-base font-medium text-gray-600">
              总工时
            </div>
            <div class="stat-value text-3xl font-bold text-primary mt-1">
              {{ totalStats.hours }} 小时
            </div>
          </div>
          <div class="stat-card p-4 bg-base-100 rounded-lg border-l-4 border-success">
            <div class="stat-title text-base font-medium text-gray-600">
              总收入 (单价：¥62.5/小时)
            </div>
            <div class="stat-value text-3xl font-bold text-success mt-1">
              ¥{{ totalStats.income }}
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 工时趋势分析 -->
        <div class="chart-card p-4 bg-base-100 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-2">
            工时趋势分析
          </h2>
          <div class="chart-wrapper h-80">
            <WorkHoursTrend
              :work-data="filteredData"
              :aggregation="filters.aggregation"
              @update:aggregation="filters.aggregation = $event"
            />
          </div>
        </div>

        <!-- 项目工时分布 -->
        <div class="chart-card p-4 bg-base-100 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-2">
            项目工时分布
          </h2>
          <div class="chart-wrapper h-80">
            <ProjectHoursDistribution :work-data="filteredData" />
          </div>
        </div>

        <!-- 月度工时统计 -->
        <div class="chart-card p-4 bg-base-100 rounded-lg shadow md:col-span-2">
          <h2 class="text-lg font-semibold mb-2">
            月度工时统计
          </h2>
          <div class="chart-wrapper h-64">
            <MonthlyWorkHours :work-data="filteredData" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.work-visualization-container {
  max-width: 1200px;
  margin: 0 auto;
}

.chart-wrapper {
  width: 100%;
  position: relative;
}
</style>
