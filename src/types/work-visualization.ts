// 工时数据类型
export interface WorkData {
  date: string
  timestamp: number
  hours: number
  project: string
  description: string
  personnel: string
}

// 筛选器状态类型
export interface FilterState {
  startDate: number | null
  endDate: number | null
  selectedProjects: string[]
  aggregation: 'day' | 'week' | 'month'
}

// 聚合后的数据点类型
export interface AggregatedDataPoint {
  label: string
  value: number
  timestamp: number
}

// 项目分布数据类型
export interface ProjectDistribution {
  project: string
  hours: number
  percentage: number
  color: string
}
