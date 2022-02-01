const { Router } = require('express')
const {
  getVirtualAssistants,
  createVirtualAssistant,
  getVirtualAssistantById
} = require('../controllers/virtualAssistant.controller')

const router = Router()

router.route('/').get(getVirtualAssistants).post(createVirtualAssistant)
router.route('/:id').get(getVirtualAssistantById)

module.exports = { virtualAssistantRoutes: router }
