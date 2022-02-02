function errorHandler(error, req, res, next) {
  console.error('ERROR-SERVER ->', error)

  if (res.headersSent) {
    console.error('ERROR-HANDLING-EXPRESS ->', error)
    // Error handling is delegated to Express
    return next(error)
  }

  let { code, message } = error

  // Violacion constraint campo unico (el codigo es 11000)
  if (code === 11000) {
    const fieldStart = message.substring(message.indexOf('index: ') + 7)
    const fieldIndexEnd = fieldStart.indexOf('_')
    const actualField = fieldStart.substring(0, fieldIndexEnd)
    const value = fieldStart
      .substring(fieldStart.indexOf('{'))
      .replace(/[^a-zA-Z 0-9]+/g, '')
      .replace(/ /g, '')

    req.statusCode = 400
    message = `El campo ${actualField} con valor = ${value} ya existe. (Este campo es único)`
  }

  // Error handling personalized
  res.status(req.statusCode || 500).json({
    status: 'fail',
    error: message
  })
}

module.exports = { errorHandler }
