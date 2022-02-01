const VirtualAssistant = require('../models/assistant.model')

const createVirtualAssistant = async (req, res, next) => {
  try {
    const virtualAssistant = await VirtualAssistant.create(req.body)

    res.status(201).json({
      virtualAssistant
    })
  } catch (err) {
    next(err)
  }
}

const getVirtualAssistants = async (req, res, next) => {
  try {
    const results = await VirtualAssistant.find()

    res.status(200).json({
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
