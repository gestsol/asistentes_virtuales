const VirtualAssistant = require('../models/assistant.model')

const createVirtualAssistant = async (req, res, next) => {
  try {
    const virtualAssistant = await VirtualAssistant.create(req.body)

    res.status(201).json({
      status: 'success',
      virtualAssistant
    })
  } catch (err) {
    next(err)
  }
}

const getVirtualAssistants = async (_, res, next) => {
  try {
    const results = await VirtualAssistant.find()

    res.status(200).json({
      status: 'success',
      results
    })
  } catch (err) {
    next(err)
  }
}

const getVirtualAssistantById = async (req, res, next) => {
  try {
    const virtualAssistant = await VirtualAssistant.findById(req.params.id)

    if (!virtualAssistant) {
      throw new Error('El asistente virtual no existe')
    }

    res.status(200).json({
      status: 'success',
      virtualAssistant
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createVirtualAssistant,
  getVirtualAssistants,
  getVirtualAssistantById
}
