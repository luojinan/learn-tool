<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  availableProjects: string[]
  selectedProjects: string[]
}>()

const emit = defineEmits<{
  'update:selected-projects': [string[]]
}>()

// 检查项目是否被选中
function isProjectSelected(project: string): boolean {
  return props.selectedProjects.includes(project)
}

// 切换项目选择状态
function toggleProject(project: string) {
  const isSelected = isProjectSelected(project)

  if (isSelected) {
    // 取消选择
    const newSelection = props.selectedProjects.filter(p => p !== project)
    emit('update:selected-projects', newSelection)
  }
  else {
    // 选择项目
    const newSelection = [...props.selectedProjects, project]
    emit('update:selected-projects', newSelection)
  }
}

// 全选/清空选择
function selectAll() {
  // 如果当前有选中的项目，则清空；否则全选
  const newSelection: string[] = []
  emit('update:selected-projects', newSelection)
}
</script>

<template>
  <div class="project-filter">
    <h3 class="text-base font-medium mb-2">
      项目筛选
    </h3>
    <div class="form-control">
      <div class="flex flex-wrap gap-2">
        <div v-if="availableProjects.length === 0" class="text-gray-500">
          暂无项目数据
        </div>

        <div v-else class="w-full">
          <div class="flex flex-wrap mb-2">
            <button
              class="btn btn-sm mr-2 mb-2"
              :class="{ 'btn-primary': selectedProjects.length === 0 }"
              @click="selectAll"
            >
              全部
            </button>
            <button
              v-for="project in availableProjects"
              :key="project"
              class="btn btn-sm mr-2 mb-2"
              :class="{ 'btn-primary': isProjectSelected(project) }"
              @click="toggleProject(project)"
            >
              {{ project }}
            </button>
          </div>
          <div class="text-sm text-gray-500">
            <span v-if="selectedProjects.length === 0">显示全部项目</span>
            <span v-else>已选择 {{ selectedProjects.length }} 个项目</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
