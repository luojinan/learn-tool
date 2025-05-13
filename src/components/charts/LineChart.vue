<script lang="ts" setup>
import type { ChartOptions } from 'chart.js'
import { Chart, registerables } from 'chart.js'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  labels: string[] // X 轴标签
  data: (number | null)[] // Y 轴数据，null 表示该点不绘制（会有断点）
  title?: string // 图表标题
  xAxisLabel?: string // X 轴标签
  yAxisLabel?: string // Y 轴标签
  responsive?: boolean // 是否响应式
  mainColor?: string // 主要颜色
}>()

// 注册所有 Chart.js 组件
Chart.register(...registerables)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// 计算最终使用的颜色
const finalMainColor = computed(() => props.mainColor || '#36A2EB')

// 处理图表配置
const chartConfig = computed(() => {
  return {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.title || '工时趋势',
          data: props.data,
          borderColor: finalMainColor.value,
          backgroundColor: `${finalMainColor.value}40`, // 添加透明度
          tension: 0.1,
          fill: true,
          spanGaps: false, // 不连接 null 数据点
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: props.responsive !== false, // 默认为 true
      maintainAspectRatio: false,
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
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            title: (tooltipItems: any[]) => {
              return tooltipItems[0].label
            },
            label: (context: any) => {
              const value = context.raw
              if (value === null) return '无工时记录'
              return `工时: ${value} 小时`
            },
          },
        },
        legend: {
          display: true,
          position: 'top',
        },
      },
    } as ChartOptions<'line'>,
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
  [() => props.data, () => props.labels],
  () => {
    if (chart) {
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
  updateChart: (newData: (number | null)[], newLabels?: string[]) => {
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
