require('dotenv').config()

const fs = require('fs')
const rootPath = process.cwd()

const { runShell } = require('../lib')
const { time } = require('../lib/time')
const { extractType, extractTransaction } = require('../lib/gcash-extractor')

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

  if (transactionType) {
    return extractTransaction(cleanContent, transactionType)
  }

  return null
}

getTransaction().then((transaction) => {
  if (transaction) {
    const date = process.env.DATE || ''
    const counter = process.env.COUNTER || ''
    const phone = process.env.PHONE || ''
    const sim = process.env.SIM || ''
    const mobile = process.env.MOBILE || ''

    const location =
      Boolean(process.argv) && process.argv[2] === '--keep'
        ? 'keep'
        : 'transactions'
    const filename = `${rootPath}/${location}/${date}-${counter} (P-${phone} S-${sim}) ${mobile}.json`

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
