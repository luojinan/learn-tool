<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component v-if="!$route.meta.noCache" :is="Component" />
    </keep-alive>
    <component v-if="$route.meta.noCache" :is="Component" />
  </router-view>

</template>
