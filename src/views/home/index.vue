<script lang="ts" setup>

const entryList = [
  {
    name: 'jap50yin',
    title: '读',
    desc: '五十音/单词',
    path: '/jap50yin',
  },
  {
    name: 'jap50yin',
    title: '写',
    desc: '五十音/单词',
    path: '/write',
  }
]

</script>

<template>
  <div class="py-2 px-2 grip-layout">
    <div v-for="(item, index) in entryList" :key="index">
      <router-link class="btn flex-col" :to="item.path">
        <div>{{ item.title }}</div>
        <div class="font-size-3">{{ item.desc
         }}</div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.grip-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
}
</style>