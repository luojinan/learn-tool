<script lang="ts" setup>
import { ref } from 'vue'

defineProps({
  cardItem: {
    type: Object,
    default: () => ({
      hiragana: '',
      katakana: '',
      romaji: '',
      meaning: '',
    }),
  },
})
const emit = defineEmits(['nextItem', 'preItem'])
const showRomaji = ref(false)

function onShowRomaji() {
  showRomaji.value = true
}
function onNextItem() {
  showRomaji.value = false
  emit('nextItem')
}
function onPreItem() {
  showRomaji.value = false
  emit('preItem')
}
</script>

<template>
  <div class="btn h-full" @click="onPreItem">
    ◀︎
  </div>
  <div class="flex-1 flex-center h-full" @click="onShowRomaji">
    <div class="text-center">
      <h2>{{ cardItem.hiragana }}</h2>
      <h3>{{ cardItem.katakana }}</h3>
      <p @click="onShowRomaji">
        {{ showRomaji ? cardItem.romaji : "🙈点击显示" }}
      </p>
      <p>{{ cardItem.meaning || "" }}</p>
    </div>
  </div>
  <div class="btn h-full" @click="onNextItem">
    ▶︎
  </div>
</template>
