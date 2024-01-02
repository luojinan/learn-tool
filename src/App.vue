<script setup>
import { onMounted, ref } from 'vue';
import { testData } from './common/const';
const random = (data) => {
  // 获取对象的所有属性
  const properties = Object.keys(data);
  // 随机选择一个属性
  const randomProperty = properties[Math.floor(Math.random() * properties.length)];

  // 获取随机选择的属性的数组
  const randomArray = data[randomProperty];
  // 随机获取数组中的一项
  const randomItem = randomArray[Math.floor(Math.random() * randomArray.length)];

  console.log(randomItem);
  return randomItem
}
const cardItem = ref({});
const showRomaji = ref(false)

let startX = 0;
let offsetX = 0;

const onTouchStart = (e) => {
  startX = e.touches[0].clientX;
};

const onTouchMove = (e) => {
  offsetX = e.touches[0].clientX - startX;
};

const onTouchEnd = () => {
  if (offsetX > 50) {
    // Swipe right, show previous card
    // if (currentIndex.value > 0) {
      getCartItem()
    // }
  } else if (offsetX < -50) {
    // Swipe left, show next card
    // if (currentIndex.value < cards.value.length - 1) {
      getCartItem()
    // }
  }
  offsetX = 0;
};

const getCartItem = () => {
  showRomaji.value = false
  cardItem.value = random(testData)
}

const onShowRomaji = () => {
  showRomaji.value = true
}

onMounted(()=>{
  getCartItem()
})

</script>

<template>
  <div class="page">
    <!-- <button @click="getCartItem">《</button> -->
    <div class="swipe-card" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <div class="card" :style="{ transform: `translateX(${offsetX}px)` }">
        <h2>{{ cardItem.hiragana }}</h2>
        <br />
        <h3>{{ cardItem.katakana }}</h3>
        <p @click="onShowRomaji">{{ showRomaji ? cardItem.romaji :'🙈点击显示' }}</p>
        <p>{{ cardItem.meaning }}</p>
      </div>
    </div>
    <button @click="getCartItem">》</button>
  </div>
  <p>词库总数：x</p>
</template>

<style>
.page {
  width: 100%;
  display: flex;
  justify-content: center;
}
.swipe-card {
  /* height: 100vh; */
  text-align: center;
  margin: 0 auto;
}
</style>