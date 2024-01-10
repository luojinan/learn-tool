<script setup lang="ts">
import { Area } from '@antv/g2plot';
import { onMounted,ref } from 'vue';

// 遍历对象，并且数字类型的值累加
function sumObj(obj: any) {
  let sum = 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if(typeof obj[key] === 'number') {
        sum += obj[key];
      }
    }
  }
  return sum;
}
const totalRef = ref()

const init = (odata) => {
  const realIncomeList = odata.map((item) => {
    return {
      time: item.time,
      value: sumObj(item),
      type: '实际收入',
    };
  });
  const lostList = odata.map((item) => {
    const list = Object.entries(item).filter(([key,val]) => val < 0);
    const loastRes = list.reduce((pre,[,nextVal]) => {
      return pre + nextVal;
    }, 0);
    return {
      time: item.time,
      value: -loastRes,
      type: '硬性支出',
    };
  });
  const data = [...lostList,...realIncomeList]
  const area = new Area(totalRef.value, {
      data,
      xField: 'time',
      yField: 'value',
      seriesField: 'type',
      tooltip: {
        customItems: (originalItems) => {
          const res = originalItems.reduce((pre,next) => {
            return pre + +(next.value);
          }, 0);
          return [...originalItems,{color:'#FF6B3B', name: "税前收入",value: res}];
        }
      }
    });
    area.render();
}

onMounted(() => {
  init(window.incomeDataList)
})
</script>

<template>
  <div ref="totalRef" />
</template>