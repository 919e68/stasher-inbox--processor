require('dotenv').config()
const rootPath = process.cwd()

const fs = require('fs')
const axios = require('axios')

const { parseArgs } = require(`${rootPath}/lib`)
const { config } = require(`${rootPath}/config`)

const { runShell } = require('../lib')
const { extractType, extractTransaction } = require('../lib/gcash-extractor')

const API_URL = 'https://api.connectpay.live/api/auto-process'
// const API_URL = 'https://stasher-api-dev.spire.ph/api/auto-process'
// const API_URL = 'http://localhost:3002/api/auto-process'

const commandArgs = parseArgs(process.argv)
const counter = commandArgs.counter || process.env.COUNTER
const transactionConfig = config[counter]
const { phone, sim, wallet } = transactionConfig

const autoSuccess = async (inbox) => {
  const data = await axios.post(API_URL, {
    password: '@!ABC12abc',
    type: inbox.type,
    datetime: inbox.datetime,
    wallet: inbox.wallet,
    amount: inbox.amount,
    name: inbox.name,
    mobile: inbox.mobile,
    msg: inbox.msg,
    balance: inbox.balance,
    reference: inbox.reference,
    duty: inbox.duty
  })

  return data.data
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

  // delete tmp image
  if (fs.existsSync(outputImg)) {
    fs.unlinkSync(outputImg)
  }

  // delete tmp output
  if (fs.existsSync(`${outputTxt}.txt`)) {
    fs.unlinkSync(`${outputTxt}.txt`)
  }

  const cleanContent = content.toString().replace(/\n/g, ' ').replace(/ +/g, ' ')
  const transactionType = extractType(cleanContent)
  const isExpressSendNotification = cleanContent.toLocaleLowerCase().indexOf('express send notification') !== -1

  const isNotListScreen = cleanContent.toLocaleLowerCase().indexOf('latest') === -1
  if (transactionType && isNotListScreen && isExpressSendNotification) {
    return extractTransaction(cleanContent, transactionType)
  }

  return null
}

getTransaction().then(async (transaction) => {
  if (transaction) {
    const date = transactionConfig.date || process.env.DATE
    const filename = `${rootPath}/${commandArgs.keep ? 'keep' : 'transactions'}/${date}-${counter} (P-${phone} S-${sim}) ${wallet}.json`

    // initialize transaction file
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, '[]', 'utf8')
    }

    const content = fs.readFileSync(filename)
    const transactions = JSON.parse(content.toString())
    const transactionReferences = transactions.map(item => item.reference)

    transaction.wallet = wallet.replaceAll('-', '')
    transaction.duty = process.env.DUTY
    transaction.num = transactions.length + 1
    transaction.id = ''
    transaction.note = ''

    await autoSuccess(transaction).then(data => {
      if (data.ok && data.status === 'match') {
        transaction.id = data.transactionId
        console.log(`✔️✔️ MATCH TRANSACTION_ID: ${data.transactionId}`)
      } else if (!data.ok && data.status === 'exists') {
        console.log(`🟢🟢 TRANSACTION ALREADY PROCESSED FOR REF#: ${transaction.reference}`)
      } else if (!data.ok && data.status === 'not_found') {
        transaction.note = 'no_request'
        console.log(`❌❌ THERE IS NO MATCH`)
      }
    })

    if (!transactionReferences.includes(transaction.reference)) {
      delete transaction.wallet
      transactions.unshift(transaction)
      fs.writeFileSync(filename, JSON.stringify(transactions, null, 2), 'utf8')
    }
  } else {
    console.log('❌❌ INVALID SCREEN')
  }
})
