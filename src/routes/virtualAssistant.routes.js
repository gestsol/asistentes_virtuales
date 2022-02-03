const { Router } = require('express')
const {
  getVirtualAssistants,
  createVirtualAssistant,
  getVirtualAssistantById,
  updateVirtualAssistant,
  deleteVirtualAssistant
} = require('../controllers/virtualAssistant.controller')

const router = Router()

router.route('/').get(getVirtualAssistants).post(createVirtualAssistant)
router.route('/:id').get(getVirtualAssistantById).patch(updateVirtualAssistant).delete(deleteVirtualAssistant)

module.exports = { virtualAssistantRoutes: router }
