<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import DateRangeFilter from '@/components/work-visualization/DateRangeFilter.vue'
import MonthlyWorkHours from '@/components/work-visualization/MonthlyWorkHours.vue'
import ProjectFilter from '@/components/work-visualization/ProjectFilter.vue'
import ProjectHoursDistribution from '@/components/work-visualization/ProjectHoursDistribution.vue'
import WorkHoursTrend from '@/components/work-visualization/WorkHoursTrend.vue'
import type { FilterState, WorkData } from '@/types/work-visualization'

// 数据加载和处理相关状态
const isLoading = ref(true)

// 初始化数据和状态
const workData = ref<WorkData[]>([])

// 筛选状态
const filters = ref<FilterState>({
  startDate: null,
  endDate: null,
  selectedProjects: [],
  aggregation: 'day', // 默认按天聚合
})

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

// 加载JSON数据
async function loadWorkData() {
  try {
    isLoading.value = true
    const response = await fetch('/data/work-data.json')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    workData.value = data

    // 初始化日期范围为全部数据的范围
    if (data.length > 0) {
      // 按时间戳排序
      const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)

      // 如果还没有设置日期范围，则使用数据的范围
      if (!filters.value.startDate && !filters.value.endDate) {
        filters.value.startDate = sortedData[0].timestamp
        filters.value.endDate = sortedData[sortedData.length - 1].timestamp
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
</script>

<template>
  <div class="work-visualization-container p-4">
    <h1 class="text-2xl font-bold mb-6">
      工时数据可视化
    </h1>

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
            @update:date-range="handleDateRangeChange"
          />

          <!-- 项目选择器 -->
          <ProjectFilter
            :available-projects="availableProjects"
            :selected-projects="filters.selectedProjects"
            @update:selected-projects="handleProjectsChange"
          />
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 工时趋势分析 -->
        <div class="chart-card p-4 bg-white rounded-lg shadow">
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
        <div class="chart-card p-4 bg-white rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-2">
            项目工时分布
          </h2>
          <div class="chart-wrapper h-80">
            <ProjectHoursDistribution :work-data="filteredData" />
          </div>
        </div>

        <!-- 月度工时统计 -->
        <div class="chart-card p-4 bg-white rounded-lg shadow md:col-span-2">
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
