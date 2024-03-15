<script setup lang="ts">
import { CDN_UMD_ANTV, ossDataUrl } from '@/common/const';
import { cacheDataOrUmd, loadScript } from '@/common/utils';
import JsonToTable from '@/components/JsonToTable/index.vue';
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

function sumNumArr(list: number[]): number {
  return list.reduce((pre, next) => {
    return pre + next;
  }, 0)
}

const totalRef = ref()
const lostRef = ref()
const inRef = ref()

interface TotalInfo {
  '至今税前总收入'?: number
  '至今税金房租总支出'?: number
  '至今到手总收入'?: number
  '至今平均到手月入'?: number
  '年终'?: number
  '年终换算为月均'?: number
  '年终后到手总收入'?: number
  '年终后平均到手月入'?: number
  '预计税前年入'?: number
  '预计到手年入'?: number
  '年终后预计到手年入'?: number
}

const totalInfo = ref<TotalInfo>({})

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

  totalInfo.value.至今到手总收入 = sumNumArr(realIncomeList.map(item => item.value))
  totalInfo.value.至今税金房租总支出 = sumNumArr(lostList.map(item => item.value))
  totalInfo.value.至今税前总收入 = totalInfo.value.至今税金房租总支出 + totalInfo.value.至今到手总收入
  totalInfo.value.至今平均到手月入 = totalInfo.value.至今到手总收入 / odata.length
  totalInfo.value.预计税前年入 = (totalInfo.value.至今税前总收入 / odata.length) * 12
  totalInfo.value.预计到手年入 = totalInfo.value.至今平均到手月入 * 12

  const area = new G2Plot.Area(totalRef.value, {
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
  const area = new G2Plot.Area(lostRef.value, {
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
const initInRef = (odata) => {
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
  const area = new G2Plot.Area(inRef.value, {
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
const otherIncomeList = ref([{ time: '2024-1', 年终奖: '100', 换算为月均: 4364.5 }, { time: '2024-3', 退税: 875.16 }])

const getIncomeData = async () => {
  const dataPath = 'incomeData'
  const dataName = 'incomeDataList'
  const dataUrl = `${ossDataUrl}/${dataPath}.js`
  const { data, msg } = await cacheDataOrUmd(dataName, dataUrl)
  dataMsg.value = msg
  incomeDataList.value = data
  return data
}

const loadAntv = async () => {
  if (window.G2Plot) return
  await loadScript(CDN_UMD_ANTV)
}

const onCreated = async () => {
  const [incomeDataList] = await Promise.all([getIncomeData(), loadAntv()])
  init(incomeDataList)
  initLostRef(incomeDataList)
  initInRef(incomeDataList)
}

onBeforeMount(() => {
  onCreated()
})
</script>

<template>
  {{ dataMsg }}
  <template v-if="incomeDataList.length">
    <p>{{ incomeDataList[0].time }}~{{ incomeDataList[incomeDataList.length - 1].time }} ({{ incomeDataList.length }})
    </p>
    <ul>
      <li v-for="(val, key) in totalInfo">{{ key }}: {{ val?.toLocaleString() }}</li>
    </ul>
    <h3 class="px-2">总到手情况</h3>
    <p class="px-2 font-size-3">收入包含提取公积金、饭补。支出包含五险一金、房租支出</p>
    <div ref="totalRef" />

    <h3 class="px-2">硬性支出情况</h3>
    <div ref="lostRef" />

    <h3 class="px-2">收入情况</h3>
    <p class="px-2 font-size-3">包含提取公积金、饭补</p>
    <div ref="inRef" />

    <ul>
      <li v-for="item in otherIncomeList"> {{ Object.keys(item).map(key => key === 'time' ? item[key] : `${key}
        ${item[key]}`).join(' ') }} </li>
    </ul>

    <json-to-table :incomeDataList v-if="incomeDataList.length" />
  </template>
</template>
