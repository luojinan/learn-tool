<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { ProjectDistribution, WorkData } from '@/types/work-visualization'

const props = defineProps<{
  workData: WorkData[]
}>()

const chartContainer = ref<HTMLDivElement | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chartType = ref<'doughnut' | 'bar'>('doughnut')
let chart: Chart | null = null

// 生成随机颜色
function generateColors(count: number): string[] {
  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    const hue = (i * 137) % 360 // 基于黄金角的颜色均匀分布
    colors.push(`hsl(${hue}, 70%, 60%)`)
  }
  return colors
}

// 计算项目分布数据
const projectDistribution = computed((): ProjectDistribution[] => {
  if (props.workData.length === 0)
    return []

  // 按项目名称分组并计算总工时
  const projectHoursMap: Record<string, number> = {}
  let totalHours = 0

  props.workData.forEach((item) => {
    if (!item.project)
      return

    if (!projectHoursMap[item.project])
      projectHoursMap[item.project] = 0

    projectHoursMap[item.project] += item.hours
    totalHours += item.hours
  })

  // 转换为数组并计算百分比
  const projects = Object.keys(projectHoursMap)
  const colors = generateColors(projects.length)

  return projects.map((project, index) => {
    const hours = projectHoursMap[project]
    const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0

    return {
      project,
      hours,
      percentage,
      color: colors[index],
    }
  }).sort((a, b) => b.hours - a.hours) // 按工时降序排列
})

// 创建或更新图表
function updateChart() {
  if (!chartCanvas.value)
    return

  const data = projectDistribution.value

  if (chart)
    chart.destroy()

  const chartData = {
    labels: data.map(item => item.project),
    datasets: [
      {
        data: data.map(item => item.hours),
        backgroundColor: data.map(item => item.color),
        borderWidth: 1,
      },
    ],
  }

  const isBarChart = chartType.value === 'bar'

  // 根据数据量自动判断图表类型
  if (data.length > 8 && chartType.value === 'doughnut')
    chartType.value = 'bar'

  // 创建图表
  chart = new Chart(chartCanvas.value, {
    type: chartType.value,
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType.value === 'doughnut',
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const index = context.dataIndex
              const item = data[index]
              return [
                `${item.project}`,
                `工时: ${item.hours.toFixed(1)} 小时`,
                `占比: ${item.percentage.toFixed(1)}%`,
              ]
            },
          },
        },
      },
      ...(isBarChart ? {
        indexAxis: 'y', // 水平条形图
        scales: {
          y: {
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              padding: 4,
            },
          },
          x: {
            title: {
              display: true,
              text: '工时 (小时)',
            },
            beginAtZero: true,
          },
        },
      } : {}),
    },
  })
}

// 监听数据和图表类型变化，更新图表
watch(
  [() => props.workData, chartType],
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
  <div class="project-hours-distribution">
    <div class="chart-controls mb-2 flex justify-end">
      <div class="btn-group">
        <button
          class="btn btn-xs"
          :class="{ 'btn-active': chartType === 'doughnut' }"
          @click="chartType = 'doughnut'"
        >
          饼图
        </button>
        <button
          class="btn btn-xs"
          :class="{ 'btn-active': chartType === 'bar' }"
          @click="chartType = 'bar'"
        >
          条形图
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
.project-hours-distribution {
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
