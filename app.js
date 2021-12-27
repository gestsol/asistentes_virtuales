const express = require('express');
const cors = require('cors');
const optionRouter = require('./routes/options.router');

const app = express();

app.use(cors('*'));
app.use(express.json());

app.use('/api/v1/options', optionRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'Fail',
    error: `Can't find ${req.originalUrl} on this server!`,
  });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(err);
  res.status(400).json({
    status: 'fail',
    error: err.message,
  });
});

module.exports = app;
