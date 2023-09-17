require('dotenv').config()
const rootPath = process.cwd()

const fs = require('fs')

// const { runShell } = require('./lib')
const { extractType, extractTransaction } = require(`${rootPath}/lib/gcash-extractor`)

const content = `
Today, 06:31 PM 0&8

Express Send Notification

You have received PHP 100.00 of GCash from M**
CH********R U, 09497862082 w/ MSG: . Your new
balance is PHP 9688.00. Ref. No. 7012121108038.
`

const cleanContent = content
.toString()
.replace(/\n/g, ' ')
.replace(/ +/g, ' ')

const transactionType = extractType(cleanContent)

if (
  transactionType &&
  cleanContent.toLocaleLowerCase().indexOf('latest') === -1
) {
  const transaction = extractTransaction(cleanContent, transactionType)
  console.log(transaction)
}
