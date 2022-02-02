const { Router } = require('express')
const {
  getVirtualAssistants,
  createVirtualAssistant,
  getVirtualAssistantById,
  updateVirtualAssistant
} = require('../controllers/virtualAssistant.controller')

const router = Router()

router.route('/').get(getVirtualAssistants).post(createVirtualAssistant)
router.route('/:id').get(getVirtualAssistantById).patch(updateVirtualAssistant)

module.exports = { virtualAssistantRoutes: router }
