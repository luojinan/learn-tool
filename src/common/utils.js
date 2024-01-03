/**
 * 从给定的数据中随机选择一个值并返回
 * 从对象中获取所有属性，然后根据属性获取对应的数组，从数组中随机选择一个项返回
 * @param {*} data 
 * @returns 
 */
export const getRandomItem = (data) => {
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