interface RandomInfo {
  remainingValues: any[], // 剩余未获取
  obtainedValues: any[], // 已获取
  currentIndex: number
}

// 从对象内字段剩余项目数组中随机取1项，并设置进字段已获取数组
export function getRandomItem(info: RandomInfo) {
  const { remainingValues, obtainedValues } = info
  let randomIndex = Math.floor(Math.random() * remainingValues.length);
  const item = remainingValues[randomIndex];
  remainingValues.splice(randomIndex, 1);
  obtainedValues.push(item);
  // item.currentIndex = obtainedValues.length - 1
  Object.assign(info, {currentIndex: obtainedValues.length - 1})
  // console.log(info,randomIndex)
}