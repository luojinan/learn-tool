<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { AggregatedDataPoint, WorkData } from '@/types/work-visualization'

const props = defineProps<{
  workData: WorkData[]
  aggregation: 'day' | 'week' | 'month'
}>()

const emit = defineEmits<{
  'update:aggregation': ['day' | 'week' | 'month']
}>()

const chartContainer = ref<HTMLDivElement | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// 更新聚合模式
function updateAggregation(newAggregation: 'day' | 'week' | 'month') {
  emit('update:aggregation', newAggregation)
}

// 将日期格式化为指定的格式
function formatDate(timestamp: number, format: 'day' | 'week' | 'month'): string {
  const date = new Date(timestamp)

  switch (format) {
    case 'day':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    case 'week':
      // 获取周的第一天（星期一）
      const firstDayOfWeek = new Date(date)
      const dayOfWeek = date.getDay() || 7 // 将周日(0)转换为7
      firstDayOfWeek.setDate(date.getDate() - dayOfWeek + 1)

      return `${firstDayOfWeek.getFullYear()}年第${getWeekNumber(firstDayOfWeek)}周`
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    default:
      return ''
  }
}

// 获取指定日期是一年中的第几周
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDays = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7)
}

// 聚合数据
function aggregateData(data: WorkData[], aggregationType: 'day' | 'week' | 'month'): AggregatedDataPoint[] {
  if (data.length === 0)
    return []

  // 按时间戳排序
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)

  // 按聚合类型分组
  const grouped = sortedData.reduce((acc, curr) => {
    const key = formatDate(curr.timestamp, aggregationType)

    if (!acc[key]) {
      acc[key] = {
        label: key,
        value: 0,
        timestamp: curr.timestamp,
      }
    }

    acc[key].value += curr.hours

    return acc
  }, {} as Record<string, AggregatedDataPoint>)

  // 转换为数组并按时间排序
  return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp)
}

// 计算聚合后的数据
const aggregatedData = computed(() => {
  return aggregateData(props.workData, props.aggregation)
})

// 创建或更新图表
function updateChart() {
  if (!chartCanvas.value)
    return

  const data = aggregatedData.value

  if (chart)
    chart.destroy()

  // 准备图表数据
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: '工时',
        data: data.map(item => item.value),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  // 创建图表
  chart = new Chart(chartCanvas.value, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '工时 (小时)',
          },
        },
        x: {
          title: {
            display: true,
            text: props.aggregation === 'day'
              ? '日期'
              : props.aggregation === 'week' ? '周' : '月份',
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              return `工时: ${context.parsed.y.toFixed(1)} 小时`
            },
          },
        },
      },
    },
  })
}

// 监听数据变化，更新图表
watch(
  [() => props.workData, () => props.aggregation],
  () => {
    updateChart()
  },
  { deep: true },
)

// 监听窗口尺寸变化，响应式调整图表
function handleResize() {
  if (chart)
    chart.resize()
}

onMounted(() => {
  updateChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart)
    chart.destroy()

  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="work-hours-trend">
    <div class="aggregation-controls mb-2 flex justify-end">
      <div class="btn-group">
        <button
          class="btn btn-xs"
          :class="{ 'btn-active': aggregation === 'day' }"
          @click="updateAggregation('day')"
        >
          按日
        </button>
        <button
          class="btn btn-xs"
          :class="{ 'btn-active': aggregation === 'week' }"
          @click="updateAggregation('week')"
        >
          按周
        </button>
        <button
          class="btn btn-xs"
          :class="{ 'btn-active': aggregation === 'month' }"
          @click="updateAggregation('month')"
        >
          按月
        </button>
      </div>
    </div>

    <div ref="chartContainer" class="chart-container">
      <canvas ref="chartCanvas" />
    </div>

    <div v-if="workData.length === 0" class="no-data flex justify-center items-center h-full">
      <p class="text-gray-500">
        无数据
      </p>
    </div>
  </div>
</template>

<style scoped>
.work-hours-trend {
  height: 100%;
  position: relative;
}

.chart-container {
  height: 100%;
  width: 100%;
}

.no-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.7);
}
</style>
