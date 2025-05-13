<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Japenese50yin } from '@/common/const'
import { getRandomItem } from '@/common/utils'
import TabList from '@/components/TabList/index.vue'

const STORAGE_KEY = 'write-tablist'
function dealList() {
  const list: { question: string; answer: string }[] = []
  for (const [, item] of Object.entries(Japenese50yin)) {
    list.push({
      question: item.hiragana,
      answer: item.romaji,
    })
    list.push({
      question: item.katakana,
      answer: item.romaji,
    })
  }
  return list
}

const TAB_CONST = [
  {
    name: '五十音',
    value: 'tab1',
    remainingValues: [],
    obtainedValues: [],
    total: 0,
    currentIndex: -1,
  },
  // {
  //   name: "单词",
  //   value: "tab2",
  //   remainingValues: [],
  //   obtainedValues: [],
  //   total: 0,
  //   currentIndex: -1
  // },
]

const active = ref('tab1')
const tabList = reactive(TAB_CONST)
const tabItem = computed(() => {
  return tabList.find((item) => item.value === active.value)
})
const currentItem = computed(() => {
  return tabItem.value.obtainedValues[tabItem.value.currentIndex]
})

function initData() {
  const list = dealList()
  return {
    allValues: list,
    total: list.length,
  }
}

function onNext() {
  const testindex = tabList.findIndex((item) => item.value === active.value)
  if (
    !tabItem.value?.obtainedValues.length &&
    !tabItem.value?.remainingValues.length
  ) {
    const { allValues, total } = initData()
    tabList[testindex] = {
      ...tabList[testindex],
      remainingValues: allValues,
      total,
    }
  }

  if (tabItem.value.currentIndex === tabItem.value?.total - 1) {
    confetti()
    return
  }
  if (tabItem.value.currentIndex === tabItem.value.obtainedValues.length - 1) {
    // 获取下一个前先校验
    const isPass = !tabItem.value.obtainedValues.length || checkAnswer()
    if (!isPass) return
    getRandomItem(tabList[testindex])
    resetAnswer()
    return
  }
  tabList[testindex].currentIndex += 1
  resetAnswer()
}

function onReset() {
  const testindex = tabList.findIndex((item) => item.value === active.value)
  tabList[testindex] = {
    ...tabList[testindex],
    remainingValues: [],
    obtainedValues: [],
    total: 0,
    currentIndex: -1,
  }
  onNext()
}

const showBubble = ref(false)
const isShaking = ref(false)
function shakeIt() {
  isShaking.value = true
  showBubble.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 1000)
}

const showAnswer = ref(false)
const youAnswer = ref('')
function resetAnswer() {
  showAnswer.value = false
  youAnswer.value = ''
}

function checkAnswer() {
  const { answer } = currentItem.value
  const isPass = youAnswer.value && answer === youAnswer.value
  !isPass && shakeIt()
  return isPass
}
function onSubmit() {
  const isPass = checkAnswer()
  if (!isPass) return
  onNext()
}

function onPre() {
  if (tabItem.value.currentIndex <= 0) return

  const testindex = tabList.findIndex((item) => item.value === active.value)
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
    console.log(error)
  }
})

watch(tabList, (value) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
})
</script>

<template>
  <div class="main-page">
    <TabList :tab-list="tabList" :model-active="active">
      <div>
        <div class="font-size-10 pb text-center relative" :class="isShaking ? 'apply-shake' : ''">
          {{ currentItem?.question }}
          <span class="font-size-4">{{ showAnswer ? currentItem?.answer : '' }}</span>
          <div v-show="showBubble" class="bubble text-center font-size-3">
            {{ youAnswer ? `我不是${youAnswer}` : '猜猜看' }}
          </div>
        </div>
        <div class="btn" @click="showAnswer = true">
          答案
        </div>
        <input v-model="youAnswer" type="text" @keyup.enter="onSubmit" @input="showBubble = false">
        <div class="flex justify-between">
          <div class="btn" @click="onPre">
            ◀︎
          </div>
          <div class="btn" @click="onNext">
            ▶︎
          </div>
        </div>
      </div>
      <div>
        <div class="btn" @click="onReset">
          重置
        </div>
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

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.apply-shake {
  animation: shake 0.82s cubic-bezier(.36, .07, .19, .97) both;
}
.bubble {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #000;
  padding: 10px;
  border-radius: 10px;
}

.bubble::before {
  content: "";
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px;
  border-style: solid;
  border-color: #000 transparent transparent transparent;
}
</style>
