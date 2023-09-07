const { exec } = require('child_process')

const runShell = (command) => {
  return new Promise(async (resolve) => {
    // execute adb command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`error executing adb command: ${error}`)

        resolve({
          ok: false,
          result: stderr
        })
      }

      resolve({
        ok: true,
        result: stdout
      })
    })
  })
}

const parseArgs = (args) => {
  const result = {}

  args.forEach(item => {
    if (item.indexOf("--") !== -1) {
      if (item.indexOf('=') !== -1) {
        const splitItem = item.split('=')
        const name = splitItem[0].replaceAll('-', '')
        const value = splitItem[1].trim()
        result[name] = value
      } else {
        const name = item.replaceAll('-', '')
        const value = true
        result[name] = value
      }
    }
  })

  return result
}

module.exports = {
  runShell,
  parseArgs
}


