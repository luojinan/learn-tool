// 1. https://uutool.cn/github-file-download/ 在线读取仓库https://github.com/tomyangsh/news-backup/tree/master/2024-04文件清单，在network拷贝请求结果
// 2. 请求结果不用格式化，保存到当前根目录 resp.json
// 3. 运行node genNe....js ，即使用nodejs读取当前目录下名为resp的json文件，并取出tree的值

// 202405 在线读取仓库文件目录工具，不支持打开控制台，尝试抓包没找到
// 改为从github网站控制台拿文件目录数据，但不再支持size，且数据结果有变化
// 同样从network中拿出文件目录json数据，存到 resp.json 运行本次修改后的 node genNe....js
import fs from 'fs'
import path from 'path'

const resp = JSON.parse(fs.readFileSync(path.resolve('./', 'resp.json'), 'utf8'))
// const tree = resp.tree

// const reg = /^\d{4}-\d{2}/

// 遍历tree对象数组，处理成对象 { 2022-02: [{'title: '为什么我厌恶疫情防控中的“抄作业”比喻？.md', size: 27}]}
// const _treeObj = tree.reduce((acc, cur) => {
//   const { path, size } = cur
//   const [fileName, title] = path.split('/')
//   if (reg.test(fileName) && title) {
//     if (!acc[fileName])
//       acc[fileName] = [{ title, size }]
//     else
//       acc[fileName].push({ title, size })
//   }
//   return acc
// }, {})

const treeObj = Object.keys(resp).map((titleKey) => {
  const cur = resp[titleKey]
  const { date } = cur
  return {
    date,
    title: titleKey,
  }
})

// // github 改为了ssr数据，需要从html中找到数据js
// const treeObj = resp.tree.items.map((item) => {
//   return {
//     // date,
//     title: item.name,
//   }
// })

// 检查没有output目录时，创建output目录，并遍历treeObj对象生成以key为名的js文件，文件内容为esm抛出数组数据
const outputDir = './output'
if (!fs.existsSync(outputDir))
  fs.mkdirSync(outputDir)

// const wantlist = { '2024-03': treeObj['2024-03'] }
const wantlist = { '2024-07': treeObj }
Object.keys(wantlist).forEach((key) => {
// Object.keys(treeObj).forEach(key => {
  const output = path.resolve(outputDir, `ghnew-${key}.js`)
  // const content = `((g)=>{g['ghnew-${key}'] = ${JSON.stringify(treeObj[key])}})(window)`
  const content = `((g)=>{g['ghnew-${key}'] = ${JSON.stringify(treeObj)}})(window)`
  fs.writeFileSync(output, content)
})
