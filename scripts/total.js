require('dotenv').config()
const rootPath = process.cwd()

const fs = require('fs')
const { parseArgs } = require(`${rootPath}/lib`)
const { config } = require(`${rootPath}/config`)

const commandArgs = parseArgs(process.argv)
const counter = commandArgs.counter || process.env.COUNTER
const transactionConfig = config[counter]
const { phone, sim, wallet } = transactionConfig

if (transactionConfig) {
  const date = transactionConfig.date || process.env.DATE

  const filename = `${rootPath}/${
    commandArgs.keep ? 'keep' : 'transactions'
  }/${date}-${counter} (P-${phone} S-${sim}) ${wallet}.json`
  console.log(filename)

  if (!fs.existsSync(filename)) {
    console.log('file does not exist')
  } else {
    const content = fs.readFileSync(filename)
    const transactions = JSON.parse(content.toString())
    let totalDeposit = 0
    let totalWithdraw = 0
    let highestBalance = 0
    const referenceCodes = []

    transactions.forEach((item) => {
      // get highest balance
      if (item.balance > highestBalance) {
        highestBalance = item.balance
      }

      // check duplicate reference code
      if (referenceCodes.includes(item.reference)) {
        console.log(`DUUPLICATE REFERENCE: ${item.reference}`)
      }

      // check unprocessed transaction
      if (!Boolean(item.id)) {
        console.log(
          'UNPROCESS TRANSACTION:',
          `mobile: ${item.mobile} | amount: ${item.amount} | reference: ${item.reference} | duty: ${item.duty}`
        )
      }

      referenceCodes.push(item.reference)

      // total amount
      if (item.type === 'RECEIVE') {
        totalDeposit += item.amount
      } else if (item.type === 'SENT') {
        totalWithdraw += item.amount
      }
    })

    console.log(`COUNT: ${transactions.length}`)
    console.log(`DEPOSIT: ${totalDeposit}`)
    console.log(`WITHDRAW: ${totalWithdraw}`)
    console.log(`TOTAL: ${totalDeposit - totalWithdraw}`)
    console.log(`HIGHEST BALANCE: ${highestBalance}`)
  }
} else {
  console.log('config not found')
}
