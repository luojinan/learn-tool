<script setup>
import { onMounted, ref } from "vue";
import { Japenese50yin, testData } from "./common/const";
const random = (data) => {
  // 获取对象的所有属性
  const properties = Object.keys(data);
  // 随机选择一个属性
  const randomProperty =
    properties[Math.floor(Math.random() * properties.length)];

  // 获取随机选择的属性的数组
  const randomArray = data[randomProperty];
  // 随机获取数组中的一项
  const randomItem =
    randomArray[Math.floor(Math.random() * randomArray.length)];

  console.log(randomItem);
  return randomItem;
};
const cardItem = ref({});
const showRomaji = ref(false);
const active = ref("tab1");

// 已获取的值
let obtainedValues = ref([]);

// 剩下未获取的值
let remainingValues = ref(Object.keys(Japenese50yin));

const total = Object.keys(Japenese50yin).length;

// 随机获取一个值并记录
const getRandomValue = () => {
  if (remainingValues.value.length > 0) {
    let randomIndex = Math.floor(Math.random() * remainingValues.value.length);
    let randomValue = remainingValues.value[randomIndex];
    obtainedValues.value.push(randomValue);
    remainingValues.value.splice(randomIndex, 1);
    return Japenese50yin[randomValue];
  } else {
    return "已经获取完所有值";
  }
};

const getCartItem = () => {
  showRomaji.value = false;
  if (active.value === "tab1") {
    cardItem.value = getRandomValue();
    return;
  }
  cardItem.value = random(testData);
};

const onShowRomaji = () => {
  showRomaji.value = true;
};

onMounted(() => {
  getCartItem();
});

const tabList = [
  {
    name: "五十音",
    value: "tab1",
  },
  {
    name: "单词",
    value: "tab2",
  },
];

const onTab = (tab) => {
  active.value = tab;
  getCartItem();
};
</script>

<template>
  <div class="main-page">
    <div class="tab">
      <div
        v-for="tab in tabList"
        :key="{ tab }"
        class="tab-item"
        :class="{ active: active === tab.value }"
        @click="onTab(tab.value)"
      >
        {{ tab.name }}
      </div>
    </div>
    <div class="page">
      <button @click="() => {}">《</button>
      <div class="swipe-card" @click="onShowRomaji">
        <div class="card">
          <h2>{{ cardItem.hiragana }}</h2>
          <h3>{{ cardItem.katakana }}</h3>
          <p @click="onShowRomaji">
            {{ showRomaji ? cardItem.romaji : "🙈点击显示" }}
          </p>
          <p>{{ cardItem.meaning || "" }}</p>
        </div>
      </div>
      <button @click="getCartItem">》</button>
    </div>
    <p class="footer">
      {{ active === "tab1" ? `${obtainedValues.length} /${total}` : "" }}
    </p>
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
  /* height: 100vh; */
  text-align: center;
  /* margin: 0 auto; */
  flex: 1;
}

.footer {
  text-align: center;
}
</style>
