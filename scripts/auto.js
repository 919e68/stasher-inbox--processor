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

const autoSuccess = async (inbox) => {
  const data = axios.post('https://stasher-api-dev.spire.ph/api/auto-process', {
    password: '@!ABC12abc',
    type: "DEPOSIT",
    datetime: inbox.datetime,
    amount: inbox.amount,
    name: inbox.name,
    mobile: inbox.mobile,
    msg: inbox.msg,
    balance: inbox.balance,
    reference: inbox.reference,
    duty: inbox.duty
  })

  console.log(data)
  return data
}

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

  if (
    transactionType &&
    cleanContent.toLocaleLowerCase().indexOf('latest') === -1
  ) {
    return extractTransaction(cleanContent, transactionType)
  }

  return null
}

getTransaction().then(async (transaction) => {
  if (transaction) {
    const date = transactionConfig.date || process.env.DATE
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

    autoSuccess(transaction)

    console.log('transaction saved.')
  }
})
