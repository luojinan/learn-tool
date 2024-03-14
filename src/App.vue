<template>
  <router-view v-slot="{ Component }">
    <template v-if="!$route.meta.noCache">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </template>
    <component v-else :is="Component" />
  </router-view>
</template>
