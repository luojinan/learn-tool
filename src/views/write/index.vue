<script lang="ts" setup>
import TabList from "@/components/TabList/index.vue";
import { Japenese50yin } from "@/common/const"
import { getRandomItem } from "@/common/utils"
import { computed, onMounted, reactive, ref, watch } from 'vue';
const STORAGE_KEY = 'write-tablist'
const dealList = () => {
  let list: { question: string, answer: string }[] = []
  for (const [, item] of Object.entries(Japenese50yin)) {
    list.push({
      question: item.hiragana,
      answer: item.romaji
    })
    list.push({
      question: item.katakana,
      answer: item.romaji
    })
  }
  return list
}

const TAB_CONST = [
  {
    name: "五十音",
    value: "tab1",
    remainingValues: [],
    obtainedValues: [],
    total: 0,
    currentIndex: -1
  },
  // {
  //   name: "单词",
  //   value: "tab2",
  //   remainingValues: [],
  //   obtainedValues: [],
  //   total: 0,
  //   currentIndex: -1
  // },
];

const active = ref("tab1");
const tabList = reactive(TAB_CONST);
const tabItem = computed(() => {
  return tabList.find(item => item.value === active.value)
})
const currentItem = computed(() => {
  return tabItem.value.obtainedValues[tabItem.value.currentIndex]
})

const initData = () => {
  const list = dealList()
  return {
    allValues: list,
    total: list.length
  }
}

const onNext = () => {
  const testindex = tabList.findIndex(item => item.value === active.value)
  if (!tabItem.value?.obtainedValues.length && !tabItem.value?.remainingValues.length) {
    const { allValues, total } = initData()
    tabList[testindex] = {
      ...tabList[testindex],
      remainingValues: allValues,
      total: total
    }
  }

  if (tabItem.value.currentIndex === tabItem.value?.total - 1) {
    alert('背完啦')
    return
  }
  if (tabItem.value.currentIndex === tabItem.value.obtainedValues.length - 1) {
    // 获取下一个前先校验
    const isPass = !tabItem.value.obtainedValues.length || checkAnswer()
    isPass && getRandomItem(tabList[testindex])
    resetAnswer()
    return
  }
  tabList[testindex].currentIndex += 1
  resetAnswer()
}

const onReset = () => {
  const testindex = tabList.findIndex(item => item.value === active.value)
  tabList[testindex] = {
    ...tabList[testindex],
    remainingValues: [],
    obtainedValues: [],
    total: 0,
    currentIndex: -1
  }
  onNext()
}

const showAnswer = ref(false)
const resetAnswer = () => {
  showAnswer.value = false
  youAnswer.value = ''
}

const youAnswer = ref('')
const checkAnswer = () => {
  const { answer } = currentItem.value
  const isPass = youAnswer.value && answer === youAnswer.value
  !isPass && alert('再回忆一下')
  return isPass
}
const onSubmit = () => {
  const isPass = checkAnswer()
  if (!isPass) return
  onNext()
}

const onPre = () => {
  if (tabItem.value.currentIndex <= 0) {
    return
  }
  const testindex = tabList.findIndex(item => item.value === active.value)
  tabList[testindex].currentIndex -= 1
  resetAnswer()
  // showAnswer.value = true
}

onMounted(() => {
  const store = localStorage.getItem(STORAGE_KEY)
  if (!store) {
    onNext()
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
})
</script>

<template>
  <div class="main-page">
    <TabList :tabList="tabList" :model-active="active">
      <div>
        <h1 class="text-center">{{ currentItem?.question }} {{ showAnswer ? currentItem?.answer : ''}}</h1>
        <div class="btn" @click="showAnswer = true">答案</div>
        <input type="text" v-model="youAnswer" @keyup.enter="onSubmit">
        <div class="flex justify-between">
          <div class="btn" @click="onPre">◀︎</div>
          <div class="btn" @click="onNext">▶︎</div>
        </div>
      </div>
      <div>
        <div class="btn" @click="onReset">重置</div>
        <p class="text-center">
          {{ `${tabItem.currentIndex + 1}/${tabItem?.total}` }}
        </p>
      </div>
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
  min-height: 40%;
}
</style>