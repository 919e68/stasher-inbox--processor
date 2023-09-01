
// const fs = require('fs')

// const { runShell } = require('./lib')
// const { extractType, extractTransaction } = require('./lib/gcash-extractor')

// const getTransaction = async () => {
//   const timestamp = Math.floor(new Date().getTime() / 1000)

//   const path = '/sdcard/Download'
//   const filename = `img_${timestamp}.png`
//   const outputImg = './tmp/output.png'
//   const outputTxt = './tmp/output'

//   await runShell(`adb shell screencap -p ${path}/${filename}`)
//   await runShell(`adb pull ${path}/${filename} ${outputImg}`)
//   await runShell(`adb shell rm ${path}/${filename}`)
//   await runShell(`tesseract ${outputImg} ${outputTxt}`)

//   const content = fs.readFileSync(`${outputTxt}.txt`)
//   const cleanContent = content.toString().replace(/\n/g, ' ').replace(/ +/g, ' ')

//   const transactionType = extractType(cleanContent)

//   if (transactionType) {
//     return extractTransaction(cleanContent, transactionType)
//   }

//   return null
// }

// getTransaction().then(transaction => {
//   console.log(transaction)
// })

console.log(process.argv)