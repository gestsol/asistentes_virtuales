const express = require('express')
const cors = require('cors')
const { routes } = require('../routes')
const { notFound, errorHandler } = require('../middlewares')

const app = express()
const BASE_URL = '/api/v1'

// MIDDLEWARES IN
app.use(cors('*'))
app.use(express.json())

// ROUTES
app.use(BASE_URL + '/virtual_assistant', routes)

// MIDDLEWARES OUT
app.use(notFound)
app.use(errorHandler)

module.exports = app
