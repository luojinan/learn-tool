<template>
  <router-view v-slot="{ Component }">
    <div v-if="!$route.meta.noCache" key="cache">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </div>
    <component :is="Component" v-else />
    <!-- 从不缓存路由->缓存路由 因为 ifelse 触发重新渲染导致丢失状态 -->
    <!-- v-show 在router-view中无效 不能同时挂载同一个路由组件? -->
  </router-view>
</template>
