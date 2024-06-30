<script lang="ts" setup>
const { tabList } = defineProps({
  tabList: {
    type: Array,
    default: () => [],
  },
  modelActive: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['onTabChange', 'update:modelActive'])

function onTab(tab) {
  emit('update:modelActive', tab)
  emit('onTabChange', tab, tabList)
}
</script>

<template>
  <div class="tab">
    <div
      v-for="tab in tabList" :key="tab.value" class="tab-item" :class="{ active: modelActive === tab.value }"
      @click="onTab(tab.value)"
    >
      {{ tab.name }}
    </div>
  </div>
  <slot />
</template>
