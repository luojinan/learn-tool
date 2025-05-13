<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import type { ChartOptions } from 'chart.js'
import { Chart, registerables } from 'chart.js'

const props = defineProps<{
  labels: string[] // 标签数组
  data: number[] // 数据数组
  title?: string // 图表标题
  backgroundColor?: string[] // 背景颜色数组
  hoverOffset?: number // 悬停偏移量
  responsive?: boolean // 是否响应式
  percentages?: number[] // 百分比数组
  isDoughnut?: boolean // 是否为甜甜圈图而非饼图
}>()

// 注册所有 Chart.js 组件
Chart.register(...registerables)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// 处理图表配置
const chartConfig = computed(() => {
  return {
    type: props.isDoughnut ? 'doughnut' : 'pie',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: props.backgroundColor || [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF',
          '#23D160',
          '#FF3860',
          '#FFDD57',
          '#209CEE',
          '#7957D5',
        ],
        hoverOffset: props.hoverOffset || 10,
        borderWidth: 1,
      }],
    },
    options: {
      responsive: props.responsive !== false, // 默认为 true
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right',
        },
        title: {
          display: !!props.title,
          text: props.title || '',
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || ''
              const value = context.raw
              let percentage = '0%'

              // 使用传入的百分比或计算百分比
              if (props.percentages && props.percentages.length > context.dataIndex) {
                percentage = `${props.percentages[context.dataIndex].toFixed(1)}%`
              }
              else {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                percentage = total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%'
              }

              return `${label}: ${value} 小时 (${percentage})`
            },
          },
        },
      },
    } as ChartOptions<'pie' | 'doughnut'>,
  }
})

// 初始化图表
function initChart() {
  if (!chartCanvas.value)
    return

  // 销毁已有图表实例
  if (chart)
    chart.destroy()

  // 创建新图表实例
  chart = new Chart(
    chartCanvas.value,
    chartConfig.value as any,
  )
}

// 监视数据变化，更新图表
watch(
  [() => props.data, () => props.labels, () => props.isDoughnut],
  () => {
    if (chart) {
      // 当图表类型改变时，需要重新创建图表
      if ((chart.config as any).type !== (props.isDoughnut ? 'doughnut' : 'pie')) {
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
      if (newLabels)
        chart.data.labels = newLabels

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
