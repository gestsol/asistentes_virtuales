const { VirtualAssistant } = require('../models/assistant.model')

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
      req.statusCode = 404
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

const updateVirtualAssistant = async (req, res, next) => {
  const body = JSON.stringify(req.body) === '{}' ? null : req.body
  const assistantId = req.params.id

  if (!body) {
    req.statusCode = 400
    throw new Error('body is required')
  }

  try {
    const virtualAssistant = await VirtualAssistant.findByIdAndUpdate(assistantId, body, { new: true })

    if (!virtualAssistant) {
      req.statusCode = 404
      throw new Error(`Assistant with id ${assistantId} does not exist`)
    }
    res.status(200).json({
      status: 'success',
      virtualAssistant
    })
  } catch (error) {
    next(error)
  }
}

const deleteVirtualAssistant = async (req, res, next) => {
  try {
    const virtualAssistant = await VirtualAssistant.findByIdAndRemove(req.params.id)
    // TODO: Eliminar todas las opciones asociadas a este asistente, usar una consulta de mongo,
    // en caso de no existir hacerlo a mano por medio de option.cotroller

    if (!virtualAssistant) {
      req.statusCode = 404
      throw new Error('No assistant was found')
    }

    res.status(200).json({
      status: 'success',
      virtualAssistant
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createVirtualAssistant,
  getVirtualAssistants,
  getVirtualAssistantById,
  updateVirtualAssistant,
  deleteVirtualAssistant
}
