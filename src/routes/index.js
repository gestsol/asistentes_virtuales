const { virtualAssistantRoutes } = require('./virtualAssistant.routes')
const { optionRoutes } = require('./options.routes')

const routes = [virtualAssistantRoutes, optionRoutes]

module.exports = { routes }
