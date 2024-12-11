<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
function back() {
  router.back()
}
</script>

<template>
  <div class="navbar bg-base-100 fixed top-0 z-50">
    <div class="navbar-start">
      <button class="btn btn-ghost btn-circle" @click="back">
        <div class="indicator">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor" />
          </svg>
        </div>
      </button>
    </div>
    <div class="navbar-center" @click="router.push('/')">
      <a class="btn btn-ghost text-xl">🌸</a>
    </div>
    <div class="navbar-end">
      <button class="btn btn-ghost btn-circle">
        <div class="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span class="badge badge-xs badge-primary indicator-item" />
        </div>
      </button>
    </div>
  </div>
  <router-view v-slot="{ Component }">
    <div class="mt-20">
      <template v-if="!$route.meta.noCache">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </template>
      <component :is="Component" v-else />
    </div>
    <!-- 从不缓存路由->缓存路由 因为 ifelse 触发重新渲染导致丢失状态 -->
    <!-- v-show 在router-view中无效 不能同时挂载同一个路由组件? -->
  </router-view>
</template>
