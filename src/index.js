/* eslint-disable no-console */
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

const { DB_URI } = process.env

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true
  })
  .then(() => console.log('DB connection successful'))

const app = require('./services/Server.service')

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log(`app running on port ${port}`)
})

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION. Shutting down...')
  console.log(err)
  server.close(() => {
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully')
  server.close(() => {
    console.log('Process terminaed.')
  })
})

// Option.find({}).then((r) => {
//   console.log(r);
// });

// Option.create({
//   optionNumber: 1,
//   optionDescription: 'Consultar Saldo',
//   options: ['61c0c4c523260490710f51e5'],
// }).then((result) => {
//   console.log(result);
// });

// Option.find({ optionNumber: 1 })
//   .populate('options')
//   .then((r) => {
//     console.log(r[0].options);
//   });
