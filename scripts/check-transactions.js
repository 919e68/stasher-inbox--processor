require('dotenv').config()

const fs = require('fs')
const rootPath = process.cwd()

const date = process.env.DATE || ''
const counter = process.env.COUNTER || ''
const phone = process.env.PHONE || ''
const sim = process.env.SIM || ''
const mobile = process.env.MOBILE || ''

const location = Boolean(process.argv) && process.argv[2] === '--keep' ? 'keep' : 'transactions'
const filename = `${rootPath}/${location}/${date}-${counter} (P-${phone} S-${sim}) ${mobile}.json`

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

  transactions.forEach(item => {
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
      console.log('UNPROCESS TRANSACTION:', `mobile: ${item.mobile} | amount: ${item.amount} | reference: ${item.reference} | duty: ${item.duty}`)
    }

    referenceCodes.push(item.reference)

    // total amount
    if (item.type === 'DEPOSIT') {
      totalDeposit += item.amount
    } else if (item.type === 'WITHDRAW') {
      totalWithdraw += item.amount
    }
  })

  console.log(`COUNT: ${transactions.length}`)
  console.log(`DEPOSIT: ${totalDeposit}`)
  console.log(`WITHDRAW: ${totalWithdraw}`)
  console.log(`TOTAL: ${totalDeposit - totalWithdraw}`)
  console.log(`HIGHEST BALANCE: ${highestBalance}`)
}


