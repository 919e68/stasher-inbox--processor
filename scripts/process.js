require('dotenv').config()
const rootPath = process.cwd()

const fs = require('fs')
const { parseArgs } = require(`${rootPath}/lib`)
const { config } = require(`${rootPath}/config`)

const { runShell } = require('../lib')
const { extractType, extractTransaction } = require('../lib/gcash-extractor')

const commandArgs = parseArgs(process.argv)
const counter = commandArgs.counter || process.env.COUNTER
const transactionConfig = config[counter]

const getTransaction = async () => {
  // initialize folders
  if (!fs.existsSync(`${rootPath}/tmp`)) {
    fs.mkdirSync(`${rootPath}/tmp`)
  }
  if (!fs.existsSync(`${rootPath}/transactions`)) {
    fs.mkdirSync(`${rootPath}/transactions`)
  }

  const timestamp = Math.floor(new Date().getTime() / 1000)

  const path = '/sdcard/Download'
  const filename = `img_${timestamp}.png`
  const outputImg = `${rootPath}/tmp/output.png`
  const outputTxt = `${rootPath}/tmp/output`

  await runShell(`adb shell screencap -p ${path}/${filename}`)
  await runShell(`adb pull ${path}/${filename} ${outputImg}`)
  await runShell(`adb shell rm ${path}/${filename}`)
  await runShell(`tesseract ${outputImg} ${outputTxt}`)

  const content = fs.readFileSync(`${outputTxt}.txt`)
  const cleanContent = content
    .toString()
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ')

  const transactionType = extractType(cleanContent)

  if (transactionType && cleanContent.toLocaleLowerCase().indexOf('latest') === -1) {
    return extractTransaction(cleanContent, transactionType)
  }

  return null
}

getTransaction().then((transaction) => {
  if (transaction) {
    const date = commandArgs.keep ? transactionConfig.date : process.env.DATE
    const counter = commandArgs.keep ? counter : process.env.COUNTER
    const { phone, sim, mobile } = transactionConfig

    const filename = `${rootPath}/${commandArgs.keep ? 'keep' : 'transactions'}/${date}-${counter} (P-${phone} S-${sim}) ${mobile}.json`
    console.log(filename)

    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, '[]', 'utf8')
    }

    const content = fs.readFileSync(filename)
    const transactions = JSON.parse(content.toString())
    transaction.duty = process.env.DUTY
    transaction.num = transactions.length + 1
    transaction.id = ''
    transaction.note = ''

    transactions.unshift(transaction)

    fs.writeFileSync(filename, JSON.stringify(transactions, null, 2), 'utf8')
    console.log('transaction saved.')
  }
})
