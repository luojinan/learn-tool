<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import CardItem from "./components/CardItem/index.vue";
import TabList from "./components/TabList/index.vue";
import { TAB_CONST } from "./common/const";

const active = ref("tab1");
const tabList = reactive(TAB_CONST);
const tabItem = computed(() => {
  return tabList.find(item => item.value === active.value)
})
const cardItem = computed(() => {
  const currentKey = tabItem.value.obtainedValues[tabItem.value.currentIndex]
  return tabItem.value.allValues[currentKey]
})

const getListInfo = (tabItem) => {
  const { remainingValues, obtainedValues, allValues } = tabItem
  if (remainingValues.length > 0) {
    let randomIndex = Math.floor(Math.random() * remainingValues.length);
    let randomValue = remainingValues[randomIndex];
    tabItem.obtainedValues.push(randomValue);
    tabItem.remainingValues.splice(randomIndex, 1);
    tabItem.currentIndex = obtainedValues.length - 1
    return allValues[randomValue];
  } else {
    return "已经获取完所有值";
  }
};

const onNext = () => {
  const tabItem = tabList.find(item => item.value === active.value)
  if (tabItem.currentIndex === Object.keys(tabItem.allValues).length - 1) {
    alert('背完啦')
    return
  }
  if (tabItem.currentIndex === tabItem.obtainedValues.length - 1) {
    getListInfo(tabItem)
    return
  }
  tabItem.currentIndex += 1
};

const onPreItem = () => {
  const tabItem = tabList.find(item => item.value === active.value)
  if (tabItem.currentIndex > 0) {
    tabItem.currentIndex = tabItem.currentIndex - 1
  }
}

const onReset = () => {
  const tabItem = tabList.find(item => item.value === active.value)
  tabItem.currentIndex = -1
  tabItem.obtainedValues = []
  tabItem.remainingValues = Object.keys(tabItem.allValues)
  onNext(active.value, tabList)
}

onMounted(() => {
  const store = localStorage.getItem('tabList')
  if (!store) {
    onNext(tabList[0].value, tabList)
    return
  }
  // 取缓存
  try {
    Object.assign(tabList, JSON.parse(store))
  } catch (error) {
    alert('初始化数据失败')
    console.log(error)
  }
})

watch(tabList, (value) => {
  localStorage.setItem('tabList', JSON.stringify(value))
})
</script>

<template>
  <div class="main-page">
    <TabList :tabList="tabList" :model-active="active">
      <div class="page">
        <CardItem :cardItem="cardItem" @nextItem="onNext" @preItem="onPreItem" />
      </div>
      <button @click="onReset">重置</button>
      <p class="footer">
        {{ `${tabItem.currentIndex + 1}/${Object.keys(tabItem.allValues).length}` }}
      </p>
    </TabList>
  </div>
</template>

<style>
.main-page {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
  padding: 10px 0;
}

.tab {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.tab-item {
  width: 100px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 10px;
}

.active {
  background: #000;
  color: #fff;
}

.page {
  width: 100%;
  display: flex;
  justify-content: center;
}

.swipe-card {
  text-align: center;
  flex: 1;
}

.footer {
  text-align: center;
}
</style>
