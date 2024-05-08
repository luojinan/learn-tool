// 1. https://uutool.cn/github-file-download/ 在线读取仓库https://github.com/tomyangsh/news-backup/tree/master/2024-04文件清单，在network拷贝请求结果
// 2. 请求结果不用格式化，保存到当前根目录 resp.json
// 3. 运行node genNe....js ，即使用nodejs读取当前目录下名为resp的json文件，并取出tree的值
import fs from 'fs'
import path from 'path'

const resp = JSON.parse(fs.readFileSync(path.resolve('./', 'resp.json'), 'utf8'))
const tree = resp.tree

const reg = /^\d{4}-\d{2}/

// 遍历tree对象数组，处理成对象 { 2022-02: [{'title: '为什么我厌恶疫情防控中的“抄作业”比喻？.md', size: 27}]}
const treeObj = tree.reduce((acc, cur) => {
  const { path, size } = cur
  const [fileName, title] = path.split('/')
  if (reg.test(fileName) && title) {
    if (!acc[fileName])
      acc[fileName] = [{ title, size }]
    else
      acc[fileName].push({ title, size })
  }
  return acc
}, {})

// 检查没有output目录时，创建output目录，并遍历treeObj对象生成以key为名的js文件，文件内容为esm抛出数组数据
const outputDir = './output'
if (!fs.existsSync(outputDir))
  fs.mkdirSync(outputDir)

const wantlist = { '2024-03': treeObj['2024-03'] }
Object.keys(wantlist).forEach((key) => {
// Object.keys(treeObj).forEach(key => {
  const output = path.resolve(outputDir, `ghnew-${key}.js`)
  const content = `((g)=>{g['ghnew-${key}'] = ${JSON.stringify(treeObj[key])}})(window)`
  fs.writeFileSync(output, content)
})
