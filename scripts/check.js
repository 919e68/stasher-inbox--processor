require('dotenv').config()
const rootPath = process.cwd()

const { parseArgs } = require(`${rootPath}/lib`)
const { config } = require(`${rootPath}/config`)

const commandArgs = parseArgs(process.argv)
const counter = commandArgs.counter || process.env.COUNTER
const transactionConfig = config[counter]
const { phone, sim, wallet } = transactionConfig

console.log('config:', {
  counter,
  phone,
  sim,
  wallet
})