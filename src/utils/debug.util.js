function apiDebug(title, message, payload = null) {
  const time = new Date().toISOString().split('T')[1]
  const hour = time.split('.')[0]

  console.log(`[${hour}] | ${title} | ${message || ''}`)
  if (payload) console.log(message)
}

module.exports = { apiDebug }
