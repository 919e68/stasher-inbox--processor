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

  console.log(stringData)

  const pattern = /(?:yesterday|today|january|february|march|april|may|june|july|august|september|october|november|december)?[\s,]*(\d{1,2}:\d{2}\s?(?:am|pm))/i;
  const match = stringData.match(pattern)

  console.log(match)

  if (match) {
    let parsedDate = match[0].replace(/(\d{1,2}:\d{2})(am|pm)/i, "$1 $2");

    console.log(parsedDate)

    if (parsedDate.includes('today')) {
      parsedDate = parsedDate
        .replace('today,', time().format('MMMM D, YYYY').toUpperCase())
        .toUpperCase()
    } else if (parsedDate.includes('yesterday,')) {
      parsedDate = parsedDate
        .replace('yesterday,', time().subtract(1, 'day').format('MMMM D, YYYY').toUpperCase())
        .toUpperCase()
    }

    return time(parsedDate, 'MMMM D, YYYY hh:mm A').format('YYYY-MM-DD hh:mm A')
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
