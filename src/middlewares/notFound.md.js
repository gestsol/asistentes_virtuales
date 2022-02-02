function notFound(req, next) {
  req.statusCode = 404

  next({
    status: 'Fail',
    error: `Can't find ${req.originalUrl} on this server!`
  })
}

module.exports = { notFound }
