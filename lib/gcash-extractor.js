const { time } = require('./time')

const extractType = (stringData) => {
  const lowerCaseString = stringData.toLowerCase()

  if (lowerCaseString.indexOf('you have received') !== -1) {
    return 'DEPOSIT'
  }

  if (lowerCaseString.indexOf('you have sent') !== -1) {
    return 'WITHDRAW'
  }

  return null
}

const extractTime = (stringData) => {
  const pattern = /(today, \d{1,2}:\d{2} [APap][Mm])|([A-Za-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2} [APap][Mm])/
  const match = stringData.match(pattern)

  if (match) {
    const parsedDate = match[0].replace("today,", time().format('MMMM D, YYYY').toUpperCase()).toUpperCase()
    return time(parsedDate, 'MMMM D, YYYY hh:mm A').format("YYYY-MM-DD hh:mm A")
  }

  return null
}

const extractAmount = (stringData, type = 'DEPOSIT') => {
  if (type === 'DEPOSIT') {
    const pattern = /you have received php (\d+(?:\.\d+)?) of/
    const match = stringData.match(pattern)

    if (match) {
      return parseFloat(match[1])
    }
  }

  if (type === 'WITHDRAW') {
    const pattern = /you have sent php (\d+(?:\.\d+)?) to/
    const match = stringData.match(pattern)

    if (match) {
      return parseFloat(match[1])
    }
  }

  return null
}

const extractName = (stringData, type = 'DEPOSIT') => {
  if (type === 'DEPOSIT') {
    const pattern = /from ([^\.]+)\./
    const match = stringData.match(pattern)

    if (match) {
      if (match[1]) {
        return `${match[1].toUpperCase()}.`
      }
    }
  }

  if (type === 'WITHDRAW') {
    const pattern = /to ([^\.]+)\./
    const match = stringData.match(pattern)

    if (match) {
      if (match[1]) {
        return `${match[1].toUpperCase()}.`
      }
    }
  }
  return null
}

const extractMobileNumber = (stringData, type = 'DEPOSIT') => {
  if (type === 'DEPOSIT') {
    const pattern = /\. (\d{11}) w\/ msg:/
    const match = stringData.match(pattern)

    if (match) {
      if (match[1]) {
        return match[1]
      }
    }
  }

  if (type === 'WITHDRAW') {
    const pattern = /\. (\d{11}) on/
    const match = stringData.match(pattern)

    if (match) {
      if (match[1]) {
        return match[1]
      }
    }
  }

  return null
}

const extractMessage = (stringData) => {
  const pattern = /msg: (.*?)\. your/
  const match = stringData.match(pattern)

  if (match) {
    if (match[1]) {
      return match[1]
    }
  }

  return null
}

const extractBalance = (stringData) => {
  const pattern = /your new balance is php (\d+\.\d{2})\. ref/
  const match = stringData.match(pattern)

  if (match) {
    if (match[1]) {
      return parseFloat(match[1])
    }
  }

  return null
}

const extractReferenceNumber = (stringData) => {
  const pattern = /ref\. no\. (\d+)\./
  const match = stringData.match(pattern)

  if (match) {
    if (match[1]) {
      return match[1]
    }
  }

  return null
}

const extractTransaction = (stringData, type) => {
  const lowerCaseString = stringData.toLowerCase()

  return {
    type: extractType(lowerCaseString),
    datetime: extractTime(lowerCaseString),
    amount: extractAmount(lowerCaseString, type),
    name: extractName(lowerCaseString, type),
    mobile: extractMobileNumber(lowerCaseString, type),
    msg: extractMessage(lowerCaseString),
    balance: extractBalance(lowerCaseString),
    reference: extractReferenceNumber(lowerCaseString)
  }
}

module.exports = {
  extractType,
  extractTransaction
}

