<script setup lang="ts">
import Chart from 'chart.js/auto'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { AggregatedDataPoint, WorkData } from '@/types/work-visualization'

const props = defineProps<{
  workData: WorkData[]
}>()

const chartContainer = ref<HTMLDivElement | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// 格式化月份显示
function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  return `${year}年${month}月`
}

// 按月份聚合数据
function aggregateMonthlyData(data: WorkData[]): AggregatedDataPoint[] {
  if (data.length === 0) return []

  // 按时间戳排序
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp)

  // 按月份分组
  const grouped = sortedData.reduce(
    (acc, curr) => {
      const date = new Date(curr.timestamp)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!acc[key]) {
        acc[key] = {
          label: key,
          value: 0,
          timestamp: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
        }
      }

      acc[key].value += curr.hours

      return acc
    },
    {} as Record<string, AggregatedDataPoint>,
  )

  // 转换为数组并按时间排序
  return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp)
}

// 计算月度数据
const monthlyData = computed(() => {
  return aggregateMonthlyData(props.workData)
})

// 创建或更新图表
function updateChart() {
  if (!chartCanvas.value) return

  const data = monthlyData.value

  if (chart) chart.destroy()

  // 准备图表数据
  const chartData = {
    labels: data.map((item) => formatMonthLabel(item.label)),
    datasets: [
      {
        label: '月度工时',
        data: data.map((item) => item.value),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  }

  // 创建图表
  chart = new Chart(chartCanvas.value, {
    type: 'bar',
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
            text: '月份',
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y
              return `工时: ${value.toFixed(1)} 小时`
            },
            afterLabel: (context) => {
              const _index = context.dataIndex
              const value = context.parsed.y
              const totalHours = data.reduce((sum, item) => sum + item.value, 0)
              const percentage = totalHours > 0 ? (value / totalHours) * 100 : 0
              return `占比: ${percentage.toFixed(1)}%`
            },
          },
        },
      },
    },
  })
}

// 监听数据变化，更新图表
watch(
  () => props.workData,
  () => {
    updateChart()
  },
  { deep: true },
)

// 监听窗口尺寸变化，响应式调整图表
function handleResize() {
  if (chart) chart.resize()
}

onMounted(() => {
  updateChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart) chart.destroy()

  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="monthly-work-hours">
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
.monthly-work-hours {
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
