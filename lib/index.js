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

module.exports = {
  runShell
}


