<script setup lang="ts">
import { ossDataUrl } from '@/common/const';
import { cacheDataOrUmd } from '@/common/utils';
import JsonToTable from '@/components/JsonToTable/index.vue';
import { Area } from '@antv/g2plot';
import { onBeforeMount, ref } from 'vue';

interface DataItem {
  time: string;
  value: number;
  type: string;
}

// 遍历对象，并且数字类型的值累加
function sumObj(obj: any) {
  let sum = 0;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'number') {
        sum += obj[key];
      }
    }
  }
  return sum;
}
const totalRef = ref()
const lostRef = ref()
const allInRef = ref()

const init = (odata) => {
  const realIncomeList = odata.map((item) => {
    return {
      time: item.time,
      value: sumObj(item),
      type: '实际收入',
    };
  });
  const lostList = odata.map((item) => {
    const list = Object.entries(item).filter(([key, val]) => val < 0);
    const loastRes = list.reduce((pre, [, nextVal]) => {
      return pre + nextVal;
    }, 0);
    return {
      time: item.time,
      value: -loastRes,
      type: '硬性支出',
    };
  });
  const data = [...lostList, ...realIncomeList]
  const area = new Area(totalRef.value, {
    data,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    theme: 'dark',
    label: {
      callback: (text) => {
        if (+text > 10000) {
          return { content: text }
        }
      }
    },
    tooltip: {
      customItems: (originalItems) => {
        const res = originalItems.reduce((pre, next) => {
          return pre + +(next.value);
        }, 0);
        return [...originalItems, { name: "税前收入", value: res }];
      }
    }
  });
  area.render();
}
const initLostRef = (odata) => {
  const list: DataItem[] = []
  odata.forEach(element => {
    Object.entries(element).sort((item, nextItem) => nextItem[1] - item[1]).forEach(([key, val]) => {
      if (typeof val === 'number' && val < 0) {
        list.push({
          time: element.time,
          value: -val,
          type: key
        })
      }
    });
  });
  // 数组的第一和第二项交换位置
  if (list.length > 1) {
    const first = list[0];
    list[0] = list[1];
    list[1] = first;
  }
  const area = new Area(lostRef.value, {
    data: list,
    xField: 'time',
    yField: 'value',
    theme: 'dark',
    seriesField: 'type',
    tooltip: {
      customItems: (originalItems) => {
        const res = originalItems.reduce((pre, next) => {
          return pre + +(next.value);
        }, 0);
        return [...originalItems, { name: "总支出", value: res }];
      }
    }
  });
  area.render();
}
const initAllInRef = (odata) => {
  const list: DataItem[] = []
  odata.forEach(element => {
    Object.entries(element).sort((item, nextItem) => item[1] - nextItem[1]).forEach(([key, val]) => {
      if (typeof val === 'number' && val >= 0) {
        list.push({
          time: element.time,
          value: val,
          type: key
        })
      }
    });
  })
  // 数组的第一和第二项交换位置
  if (list.length > 1) {
    const first = list[0];
    list[0] = list[1];
    list[1] = first;
  }
  const area = new Area(allInRef.value, {
    data: list,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    theme: 'dark',
    yAxis: {
      min: 20000
    },
    tooltip: {
      customItems: (originalItems) => {
        const res = originalItems.reduce((pre, next) => {
          return pre + +(next.value);
        }, 0);
        return [...originalItems, { name: "税前收入", value: res }];
      }
    }
  });
  area.render();
}

const dataMsg = ref('')
const incomeDataList = ref([])

const getIncomeData = async () => {
  const dataPath = 'incomeData'
  const dataName = 'incomeDataList'
  const dataUrl = `${ossDataUrl}/${dataPath}.js`
  const {data, msg} = await cacheDataOrUmd(dataName,dataUrl)
  dataMsg.value = msg
  incomeDataList.value = data
  return data
}

const onCreated = async () =>{
  const incomeDataList = await getIncomeData()
  init(incomeDataList)
  initLostRef(incomeDataList)
  initAllInRef(incomeDataList)
}

onBeforeMount(()=>{
  onCreated()
})
</script>

<template>
  {{ dataMsg }}
    <h3 class="px-2">总到手情况</h3>
    <p class="px-2 font-size-3">收入包含提取公积金、饭补。支出包含五险一金、房租支出</p>
    <div ref="totalRef" />

    <h3 class="px-2">硬性支出情况</h3>
    <div ref="lostRef" />

    <h3 class="px-2">收入情况</h3>
    <p class="px-2 font-size-3">包含提取公积金、饭补</p>
    <div class="mb-12" ref="allInRef" />

    <p>2024-2 年终 52,374 (换算为月均 4,364.5)</p>
    <p>2024-3 退税 875.16</p>

    <json-to-table :incomeDataList v-if="incomeDataList.length" />
</template>
