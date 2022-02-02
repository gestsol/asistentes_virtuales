const mongoose = require('mongoose')
const dotenv = require('dotenv')
const { Server } = require('./services/Server.service')

dotenv.config({ path: './.env' })

const { DB_URI, PORT } = process.env

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true
  })
  .then(() => {
    console.log('DB -> connection successful')
    const port = PORT || 3000

    Server.listen(port, () => {
      console.log(`API -> listening on port ${port}`)
    })
  })

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION -> Shutting down...')
  console.error(err)

  Server.close(() => {
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  console.error('SIGTERM RECEIVED -> Shutting down gracefully')

  server.close(() => {
    console.log('API -> Process terminaed.')
  })
})
