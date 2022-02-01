const express = require('express')
const cors = require('cors')
const { routes } = require('../routes')

const app = express()
const BASE_URL = '/api/v1'

app.use(cors('*'))
app.use(express.json())

app.use(BASE_URL + '/virtual_assistant', routes)

app.all('*', (req, res, _) => {
  res.status(404).json({
    status: 'Fail',
    error: `Can't find ${req.originalUrl} on this server!`
  })
})

app.use((err, _, res) => {
  console.log(err)
  // eslint-disable-next-line no-console
  let { code, message } = err

  // Violacion constraint campo unico (el codigo es 11000)
  if (code === 11000) {
    const fieldStart = message.substring(message.indexOf('index: ') + 7)
    const fieldIndexEnd = fieldStart.indexOf('_')
    const actualField = fieldStart.substring(0, fieldIndexEnd)
    const value = fieldStart
      .substring(fieldStart.indexOf('{'))
      .replace(/[^a-zA-Z 0-9]+/g, '')
      .replace(/ /g, '')

    message = `El campo ${actualField} con valor = ${value} ya existe. (Este campo es único)`
  }

  res.status(400).json({
    status: 'fail',
    error: message
  })
})

module.exports = app
