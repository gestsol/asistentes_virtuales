const { apiDebug } = require('../utils/debug.util')

function request(req, _, next) {
  apiDebug('HTTP-IN', `${req.method} ${req.originalUrl}`)
  next()
}

module.exports = { request }
