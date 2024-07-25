<script setup lang="ts">
import { computed, ref } from 'vue'
import booksJson from './books.json'

// 假设这是从API获取的图书数据
const books = ref(booksJson)

// 用户输入的搜索关键词
const searchQuery = ref('')

// 计算属性，根据搜索关键词过滤图书列表
const filteredBooks = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return books.value.filter(book =>
    book.title.toLowerCase().includes(query)
    || book.author.toLowerCase().includes(query),
  )
})
</script>

<template>
  <div>
    <input
      v-model="searchQuery"
      type="text"
      placeholder="搜索书名或作者..."
    >
    <p>图书总数: {{ books.length }}</p>
    <ul>
      <li v-for="(book) in filteredBooks" :key="book.title">
        《{{ book.title }}》 - {{ book.author }}
      </li>
    </ul>
  </div>
</template>
