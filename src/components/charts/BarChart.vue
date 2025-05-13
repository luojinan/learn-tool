<script lang="ts" setup>
import type { ChartOptions } from 'chart.js'
import { Chart, registerables } from 'chart.js'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  labels: string[] // X 轴标签
  data: number[] // Y 轴数据
  title?: string // 图表标题
  xAxisLabel?: string // X 轴标签
  yAxisLabel?: string // Y 轴标签
  responsive?: boolean // 是否响应式
  barColor?: string // 柱状图颜色
  isHorizontal?: boolean // 是否为水平柱状图
}>()

// 注册所有 Chart.js 组件
Chart.register(...registerables)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// 计算最终使用的颜色
const finalBarColor = computed(() => props.barColor || '#4BC0C0')

// 处理图表配置
const chartConfig = computed(() => {
  return {
    type: props.isHorizontal ? 'horizontalBar' : 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.title || '数据统计',
          data: props.data,
          backgroundColor: finalBarColor.value,
          borderColor: finalBarColor.value,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: props.responsive !== false, // 默认为 true
      maintainAspectRatio: false,
      indexAxis: props.isHorizontal ? 'y' : 'x', // Chart.js v3 的水平柱状图配置
      scales: {
        x: {
          title: {
            display: !!props.xAxisLabel,
            text: props.xAxisLabel || '',
          },
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: '#e0e0e0',
          },
        },
        y: {
          title: {
            display: !!props.yAxisLabel,
            text: props.yAxisLabel || '',
          },
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: '#e0e0e0',
          },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: !!props.title,
          text: props.title || '',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || ''
              const value = context.raw
              return `${label}: ${value} 小时`
            },
          },
        },
      },
    } as ChartOptions<'bar'>,
  }
})

// 初始化图表
function initChart() {
  if (!chartCanvas.value) return

  // 销毁已有图表实例
  if (chart) chart.destroy()

  // 创建新图表实例
  chart = new Chart(chartCanvas.value, chartConfig.value as any)
}

// 监视数据变化，更新图表
watch(
  [() => props.data, () => props.labels, () => props.isHorizontal],
  () => {
    if (chart) {
      // 当图表方向改变时，需要重新创建图表
      if (
        (props.isHorizontal && (chart.options as any).indexAxis !== 'y') ||
        (!props.isHorizontal && (chart.options as any).indexAxis === 'y')
      ) {
        initChart()
        return
      }

      chart.data.labels = props.labels
      chart.data.datasets[0].data = props.data
      chart.update()
    }
  },
  { deep: true },
)

// 组件挂载后初始化图表
onMounted(() => {
  initChart()
})

// 定义向外暴露的方法
defineExpose({
  updateChart: (newData: number[], newLabels?: string[]) => {
    if (chart) {
      chart.data.datasets[0].data = newData
      if (newLabels) chart.data.labels = newLabels

      chart.update()
    }
  },
})
</script>

<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" />
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
