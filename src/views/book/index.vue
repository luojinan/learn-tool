<script setup lang="ts">
import { computed, ref } from 'vue'
import { ossDataUrl } from '@/common/const'
import { useUmdDataCacheOrFetch } from '@/hook/fetch'

interface Book {
  title: string
  author: string
}

const ossPath = 'book'
const dataName = 'book'
const dataUrl = `${ossDataUrl}/${ossPath}.js`
const [books, dataFromMsg, reFetch] = useUmdDataCacheOrFetch<Book[]>(
  dataName,
  dataUrl,
)

// 用户输入的搜索关键词
const searchQuery = ref('')

// 计算属性，根据搜索关键词过滤图书列表
const filteredBooks = computed(() => {
  if (!books.value) return []
  const query = searchQuery.value.toLowerCase()
  return books.value.filter(
    (book) =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query),
  )
})
</script>

<template>
  <div class="px-2 flex flex-col justify-center">
    <input
      v-model="searchQuery"
      class="input input-bordered input-primary w-full max-w-xs mx-auto"
      type="text"
      placeholder="搜索书名或作者..."
    >
    <p class="text-center mt-1 mb-4">
      图书总数: {{ books && books.length }} - <span class="text-xs" @click="reFetch">{{ dataFromMsg }}</span>
    </p>
    <ul>
      <li v-for="(book) in filteredBooks" :key="book.title" class="btn btn-sm btn-primary mb-2 flex justify-start">
        《{{ book.title }}》 - {{ book.author }}
      </li>
    </ul>
  </div>
</template>
