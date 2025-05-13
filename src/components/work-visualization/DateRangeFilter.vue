<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  startDate: number | null
  endDate: number | null
  allDatesAvailable?: boolean // 是否可以选择所有日期
}>()

const emit = defineEmits<{
  'update:date-range': [{ start: number | null; end: number | null }]
  'select-all-dates': [] // 添加选择所有日期的事件
}>()

// 将时间戳转换为YYYY-MM-DD格式
function timestampToDateString(timestamp: number | null): string {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 将YYYY-MM-DD格式转换为时间戳（当天0:00的时间戳）
function dateStringToTimestamp(dateString: string): number | null {
  if (!dateString) return null

  const [year, month, day] = dateString.split('-').map(Number)
  if (!year || !month || !day) return null

  // 创建日期（当天0:00）
  const date = new Date(year, month - 1, day, 0, 0, 0, 0)
  return date.getTime()
}

// 将结束日期调整为当天的23:59:59.999
function adjustEndDateToEndOfDay(timestamp: number | null): number | null {
  if (!timestamp) return null

  const date = new Date(timestamp)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

// 计算日期字符串
const startDateString = computed(() => timestampToDateString(props.startDate))
const endDateString = computed(() => timestampToDateString(props.endDate))

// 处理开始日期变更
function handleStartDateChange(event: Event) {
  const target = event.target as HTMLInputElement
  const newStartDate = dateStringToTimestamp(target.value)

  emit('update:date-range', {
    start: newStartDate,
    end: props.endDate,
  })
}

// 处理结束日期变更
function handleEndDateChange(event: Event) {
  const target = event.target as HTMLInputElement
  const newEndDate = dateStringToTimestamp(target.value)

  // 将结束日期调整为当天的23:59:59.999
  const adjustedEndDate = adjustEndDateToEndOfDay(newEndDate)

  emit('update:date-range', {
    start: props.startDate,
    end: adjustedEndDate,
  })
}

// 选择所有日期
function handleSelectAllDates() {
  emit('select-all-dates')
}
</script>

<template>
  <div class="date-range-filter">
    <h3 class="text-base font-medium mb-2">
      日期范围
    </h3>
    <div class="flex flex-col sm:flex-row gap-2">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">开始日期</span>
        </label>
        <input
          type="date"
          :value="startDateString"
          class="input input-bordered w-full"
          :max="endDateString"
          @input="handleStartDateChange"
        >
      </div>
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">结束日期</span>
        </label>
        <input
          type="date"
          :value="endDateString"
          class="input input-bordered w-full"
          :min="startDateString"
          @input="handleEndDateChange"
        >
      </div>
    </div>
    <div class="mt-2">
      <button
        type="button"
        class="btn btn-sm btn-outline"
        :disabled="!allDatesAvailable"
        @click="handleSelectAllDates"
      >
        选择所有日期
      </button>
    </div>
  </div>
</template>
