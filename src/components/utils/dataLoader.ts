/**
 * 数据加载器
 * 负责加载和准备工时可视化所需的所有数据
 */
import type { WorkEntry } from './csvParser'
import { aggregateHoursByDate, aggregateHoursByMonth, getHoursOrNull, getProjectDistribution, loadWorkDataFromCSV } from './csvParser'

// CSV 文件路径
const CSV_FILE_PATH = '/日期-工作表1.csv'

// 工时趋势图数据结构
export interface HoursTrendData {
  labels: string[] // 日期标签
  data: (number | null)[] // 对应的工时数据，null 表示零工时
}

// 项目分布数据结构
export interface ProjectDistributionData {
  labels: string[] // 项目名称
  data: number[] // 工时数量
  percentages: number[] // 百分比
  backgroundColor: string[] // 背景颜色
}

// 月度工时数据结构
export interface MonthlyHoursData {
  labels: string[] // 月份标签
  data: number[] // 每月总工时
}

// 可视化仪表盘完整数据
export interface DashboardData {
  rawData: WorkEntry[] // 原始数据
  hoursTrend: HoursTrendData // 工时趋势图数据
  projectDistribution: ProjectDistributionData // 项目分布数据
  monthlyHours: MonthlyHoursData // 月度工时数据
  filteredData: WorkEntry[] // 筛选后的数据
  availableProjects: string[] // 可用的项目列表
  dateRange: { // 数据的日期范围
    start: string
    end: string
  }
}

/**
 * 生成随机颜色数组
 * @param count 需要的颜色数量
 * @returns 颜色数组
 */
function generateColors(count: number): string[] {
  const colors: string[] = []

  // 一些预定义的好看颜色
  const baseColors = [
    '#36A2EB',
    '#FF6384',
    '#4BC0C0',
    '#FF9F40',
    '#9966FF',
    '#FF6384',
    '#C9CBCF',
    '#FFCD56',
    '#4BC0C0',
    '#FF9F40',
  ]

  // 如果预定义颜色足够，直接使用
  if (count <= baseColors.length)
    return baseColors.slice(0, count)

  // 如果预定义颜色不够，生成随机颜色
  for (let i = 0; i < count; i++) {
    if (i < baseColors.length) {
      colors.push(baseColors[i])
    }
    else {
      // 生成随机颜色
      const r = Math.floor(Math.random() * 200 + 55)
      const g = Math.floor(Math.random() * 200 + 55)
      const b = Math.floor(Math.random() * 200 + 55)
      colors.push(`rgb(${r}, ${g}, ${b})`)
    }
  }

  return colors
}

/**
 * 准备工时趋势图数据
 * @param entries 工时条目数组
 * @returns 工时趋势图数据
 */
function prepareHoursTrendData(entries: WorkEntry[]): HoursTrendData {
  const hoursByDate = aggregateHoursByDate(entries)

  // 按日期排序
  const sortedDates = Object.keys(hoursByDate).sort()

  const labels = sortedDates
  const data = sortedDates.map(date => getHoursOrNull(hoursByDate[date]))

  return { labels, data }
}

/**
 * 准备项目分布数据
 * @param entries 工时条目数组
 * @returns 项目分布数据
 */
function prepareProjectDistributionData(entries: WorkEntry[]): ProjectDistributionData {
  const distribution = getProjectDistribution(entries)

  const labels = distribution.map(item => item.name)
  const data = distribution.map(item => item.hours)
  const percentages = distribution.map(item => item.percentage)
  const backgroundColor = generateColors(labels.length)

  return { labels, data, percentages, backgroundColor }
}

/**
 * 准备月度工时数据
 * @param entries 工时条目数组
 * @returns 月度工时数据
 */
function prepareMonthlyHoursData(entries: WorkEntry[]): MonthlyHoursData {
  const hoursByMonth = aggregateHoursByMonth(entries)

  // 按月份排序
  const sortedMonths = Object.keys(hoursByMonth).sort()

  const labels = sortedMonths
  const data = sortedMonths.map(month => hoursByMonth[month])

  return { labels, data }
}

/**
 * 获取数据的日期范围
 * @param entries 工时条目数组
 * @returns 日期范围对象
 */
function getDateRange(entries: WorkEntry[]): { start: string, end: string } {
  let start = '9999-12-31'
  let end = '0000-01-01'

  for (const entry of entries) {
    if (entry.date < start)
      start = entry.date

    if (entry.date > end)
      end = entry.date
  }

  return { start, end }
}

/**
 * 加载并准备仪表盘数据
 * @param dateRangeFilter 可选的日期范围筛选
 * @param projectFilter 可选的项目筛选
 * @returns Promise<DashboardData> 仪表盘数据
 */
export async function loadDashboardData(
  dateRangeFilter?: { start: string, end: string },
  projectFilter?: string[],
): Promise<DashboardData> {
  // 加载原始数据
  const rawData = await loadWorkDataFromCSV(CSV_FILE_PATH)

  // 获取所有可用项目
  const availableProjects = Array.from(new Set(rawData.map(entry => entry.project))).filter(Boolean).sort()

  // 获取数据日期范围
  const dateRange = getDateRange(rawData)

  // 应用筛选器
  let filteredData = [...rawData]

  // 应用日期范围筛选
  if (dateRangeFilter) {
    filteredData = filteredData.filter((entry) => {
      return entry.date >= dateRangeFilter.start && entry.date <= dateRangeFilter.end
    })
  }

  // 应用项目筛选
  if (projectFilter && projectFilter.length > 0) {
    filteredData = filteredData.filter((entry) => {
      return projectFilter.includes(entry.project)
    })
  }

  // 准备各图表数据
  const hoursTrend = prepareHoursTrendData(filteredData)
  const projectDistribution = prepareProjectDistributionData(filteredData)
  const monthlyHours = prepareMonthlyHoursData(filteredData)

  return {
    rawData,
    filteredData,
    hoursTrend,
    projectDistribution,
    monthlyHours,
    availableProjects,
    dateRange,
  }
}
