const Mitm = require("mitm")
const mitm = Mitm()



mitm.on("request", function(req, res) {
  console.log('there is a requestt')
})