/**
 * CSV 解析和数据处理工具
 * 用于解析工时数据 CSV 文件，处理各种格式的行，转换为标准 JSON 结构
 */

export interface WorkEntry {
  date: string // 标准化日期 YYYY-MM-DD
  hours: number | null // 工时（小时），null 表示未记录或无效
  project: string // 项目名称
  description: string // 工作内容简述
  personnel: string // 人员（可能为空）
}

/**
 * 将日期格式统一转换为 YYYY-MM-DD
 * @param dateStr 原始日期字符串，如 YYYY/MM/DD 或 YYYY-MM-DD
 * @returns 标准化的日期字符串 YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return ''

  // 如果已经是 YYYY-MM-DD 格式，直接返回
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) return dateStr

  // 处理 YYYY/MM/DD 格式
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr))
    return dateStr.replace(/\//g, '-')

  return ''
}

/**
 * 判断是否为汇总行（如 ",68,,,," 或 "总27,,,,,"）
 * @param line CSV 行
 * @returns 是否为汇总行
 */
function isSummaryLine(line: string): boolean {
  // 处理仅包含单个数字的汇总行，如 ",68,,,,"
  if (/^,\d+,,,,\s*$/.test(line)) return true

  // 处理以 "总" 开头的汇总行，如 "总27,,,,,"
  if (/^总\d+,,,,,\s*$/.test(line)) return true

  return false
}

/**
 * 判断是否为空行
 * @param line CSV 行
 * @returns 是否为空行
 */
function isEmptyLine(line: string): boolean {
  return /^,{4,}\s*$/.test(line)
}

/**
 * 解析标准 CSV 行格式
 * @param row 已拆分的 CSV 行数组
 * @returns 工时条目对象
 */
function parseStandardRow(row: string[]): WorkEntry | null {
  if (row.length < 5) return null

  const date = normalizeDate(row[0]?.trim() || '')
  if (!date) return null

  const hours = parseFloat(row[1]?.trim() || '0')
  const project = row[2]?.trim() || ''
  const description = row[3]?.trim() || ''
  const personnel = row[4]?.trim() || ''

  return {
    date,
    hours: isNaN(hours) ? null : hours,
    project,
    description,
    personnel,
  }
}

/**
 * 解析特殊格式行（引号内的空格分隔数据）
 * @param line 原始 CSV 行
 * @returns 工时条目对象
 */
function parseSpecialRow(line: string): WorkEntry | null {
  // 移除首尾引号
  const content = line.replace(/^"|"$/g, '').trim()

  // 按空格分割，获取前三个部分（日期、工时、项目）
  const parts = content.split(' ')
  if (parts.length < 3) return null

  const date = normalizeDate(parts[0])
  if (!date) return null

  const hours = parseFloat(parts[1])
  const project = parts[2]

  // 剩余部分作为工作内容简述
  const description = parts.slice(3).join(' ').trim()

  return {
    date,
    hours: isNaN(hours) ? null : hours,
    project,
    description,
    personnel: '',
  }
}

/**
 * 解析 CSV 内容
 * @param csvContent CSV 文件内容
 * @returns 解析后的工时数据数组
 */
export function parseCSV(csvContent: string): WorkEntry[] {
  if (!csvContent) return []

  const lines = csvContent.split('\n')
  const entries: WorkEntry[] = []

  // 跳过标题行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()

    // 跳过空行和汇总行
    if (!line || isEmptyLine(line) || isSummaryLine(line)) continue

    // 处理特殊格式行（引号内的空格分隔数据）
    if (line.startsWith('"') && line.endsWith('"')) {
      const entry = parseSpecialRow(line)
      if (entry) entries.push(entry)

      continue
    }

    // 处理标准 CSV 行
    const row = line.split(',')
    const entry = parseStandardRow(row)
    if (entry) entries.push(entry)
  }

  return entries
}

/**
 * 从 CSV 文件路径加载工时数据
 * @param filePath CSV 文件路径
 * @returns Promise<WorkEntry[]> 解析后的工时数据数组
 */
export async function loadWorkDataFromCSV(
  filePath: string,
): Promise<WorkEntry[]> {
  try {
    const response = await fetch(filePath)
    if (!response.ok)
      throw new Error(
        `Failed to load CSV file: ${response.status} ${response.statusText}`,
      )

    const csvContent = await response.text()
    return parseCSV(csvContent)
  } catch (error) {
    console.error('Error loading or parsing CSV:', error)
    return []
  }
}

/**
 * 获取日期的工时，为零时返回 null
 * @param hours 工时数
 * @returns 处理后的工时值，为零时返回 null
 */
export function getHoursOrNull(hours: number | null): number | null {
  if (hours === null || hours === 0) return null

  return hours
}

/**
 * 按日期聚合工时数据
 * @param entries 工时条目数组
 * @returns 以日期为键，工时为值的对象
 */
export function aggregateHoursByDate(
  entries: WorkEntry[],
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const entry of entries) {
    if (entry.date && entry.hours !== null) {
      if (!result[entry.date]) result[entry.date] = 0

      result[entry.date] += entry.hours
    }
  }

  return result
}

/**
 * 按月份聚合工时数据
 * @param entries 工时条目数组
 * @returns 以月份(YYYY-MM)为键，工时为值的对象
 */
export function aggregateHoursByMonth(
  entries: WorkEntry[],
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const entry of entries) {
    if (entry.date && entry.hours !== null) {
      // 提取月份 (YYYY-MM)
      const month = entry.date.substring(0, 7)

      if (!result[month]) result[month] = 0

      result[month] += entry.hours
    }
  }

  return result
}

/**
 * 按项目聚合工时数据
 * @param entries 工时条目数组
 * @returns 以项目为键，工时为值的对象
 */
export function aggregateHoursByProject(
  entries: WorkEntry[],
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const entry of entries) {
    if (entry.project && entry.hours !== null) {
      if (!result[entry.project]) result[entry.project] = 0

      result[entry.project] += entry.hours
    }
  }

  return result
}

/**
 * 按项目聚合工时数据，并计算百分比
 * @param entries 工时条目数组
 * @returns 项目工时分布数据数组
 */
export function getProjectDistribution(
  entries: WorkEntry[],
): { name: string; hours: number; percentage: number }[] {
  const projectHours = aggregateHoursByProject(entries)
  const totalHours = Object.values(projectHours).reduce(
    (sum, hours) => sum + hours,
    0,
  )

  return Object.entries(projectHours)
    .map(([project, hours]) => ({
      name: project,
      hours,
      percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0,
    }))
    .sort((a, b) => b.hours - a.hours) // 按工时降序排列
}
