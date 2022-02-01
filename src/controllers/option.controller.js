/* eslint-disable no-prototype-builtins */
const { Types } = require('mongoose')
const _ = require('lodash')
const Option = require('../models/option.model')

const _validateParentOpt = async parentOptStr => {
  const parentOpt = await Option.findById(parentOptStr)

  if (!parentOpt || !parentOpt.options) {
    throw new Error('Invalid parentOpt')
  }

  return parentOpt
}

/**
 * Recibe un arreglo de ids de opciones y los asocia a una opcion padre.
 * @param  {ObjectId} parentOptId id de la opcion padre
 * @param  {array<ObjectId>} childrenIds ids de opciones hijas que se quieren asociar al padre
 */
const _associateMultipleChildsToParent = async (parentOpt, childrenIds) => {
  // encontrar los childrenIds validos y que sean unicos
  const validChildrenIds = await Option.find({
    _id: { $in: childrenIds }
  }).then(results => {
    return _.uniq(results.map(r => r._id.toString()))
  })

  await Option.updateMany({ _id: { $in: validChildrenIds } }, { parentOpt: parentOpt._id })

  const parentOptions = parentOpt.options && parentOpt.options.map(childOpt => childOpt.toString())

  const allChildren = parentOptions ? _.uniq([...parentOptions, ...validChildrenIds]) : validChildrenIds

  return allChildren
}

const _insertChildrenAsObjects = async (children, virtualAssistantID) => {
  const childrenWithAssistantID = children.map(child => {
    child.virtualAssistant = virtualAssistantID
    return child
  })
  return Option.insertMany(childrenWithAssistantID).then(inserted => inserted.map(child => child._id))
}

const _removeParentOpt = async parentOptId => {
  const children = await Option.find({ parentOptId })
  const promises = children.map(child => {
    child.parentOpt = undefined
    return child.save()
  })

  return Promise.all(promises)
}

const _removeChildReference = child => {
  return Option.updateOne(
    { _id: child.parentOpt },
    {
      $pullAll: {
        options: [child._id]
      }
    }
  )
}

const createOption = async (req, res, next) => {
  try {
    let parentOpt

    if (req.body.parentOpt) {
      parentOpt = await _validateParentOpt(req.body.parentOpt)
    }

    const { options, virtualAssistant, ...body } = req.body
    const virtualAssistantID = req.params.virtualAssistantId

    const option = await Option.create({ virtualAssistant: virtualAssistantID, ...body })

    // Si las opciones del body no son ids de mongo, quiere decir que son
    // objetos de tipo options, por lo tanto, se deben crear y luego asociar.
    if (options?.length) {
      const optionsAreObjectIds = Types.ObjectId.isValid(options[0])
      if (optionsAreObjectIds === false) {
        const childrenIds = await _insertChildrenAsObjects(options, virtualAssistantID)
        await _associateMultipleChildsToParent(option._id, childrenIds)
        option.options = childrenIds
      }

      if (optionsAreObjectIds === true) {
        const optionChildren = await _associateMultipleChildsToParent(option, options)
        option.options = optionChildren
      }

      await option.save()
      await option.populate('options')
    }

    if (parentOpt) {
      parentOpt.options.push(option)
      await parentOpt.save({ validateBeforeSave: true })
    }

    res.status(201).json({
      status: 'success',
      option
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    next(err)
  }
}

const updateOption = async (req, res, next) => {
  try {
    const body = { ...req.body }
    const doc = await Option.findById(req.params.id)
    let parentOpt

    if (!doc) {
      return next(new Error(`Option with id ${req.params.id} does not exist`))
    }

    if (body.parentOpt) {
      parentOpt = await _validateParentOpt(body.parentOpt)
    }

    if (doc.action && body.options) {
      doc.action = undefined
    }

    // Manejar el caso de actualizacion del campo options.
    if (((!doc.options && !doc.action) || doc.options) && body.options) {
      // si el documento que se quiere actualizar tiene options, es decir, si es un parentOpt
      // de otras opciones, eliminar esa relacion de las opciones hijas.
      if (doc.options) {
        await _removeParentOpt(doc._id)
      }

      // Si las opciones del body no son ids de mongo, quiere decir que son
      // objetos de tipo options, por lo tanto, se deben crear y luego asociar.
      if (Types.ObjectId.isValid(body.options[0]) === false) {
        body.options = await _insertChildrenAsObjects(body.options, doc.virtualAssistant)
      }

      body.options = _.uniq(body.options)
      const childrenOptions = await _associateMultipleChildsToParent(doc._id, body.options)
      doc.options = childrenOptions
      await doc.populate('options')
    }

    Object.keys(body).forEach(key => {
      // No modificar parentOpt si se quiere eliminar, es decir, si viene como null en el body.
      // Esta operacion se hara posteriormente.
      if (key === 'parentOpt' && !body[key]) {
        return
      }

      if (key === 'options') {
        return
      }

      doc[key] = body[key]
    })

    // Si se recibe parentOpt en el body como un falsy value, quiere decir que se quiere eliminar la
    // la relacion.
    if (body.hasOwnProperty('parentOpt') && !body.parentOpt) {
      await _removeChildReference(doc)
      doc.parentOpt = undefined
    }

    await doc.save({ validateBeforeSave: true })

    if (parentOpt) {
      parentOpt.options.push(doc)
      await parentOpt.save({ validateBeforeSave: true })
    }

    res.status(200).json({
      status: 'success',
      option: doc
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    next(err)
  }
}

const getOptions = async (req, res, next) => {
  try {
    let filter = {
      virtualAssistant: req.params.virtualAssistantId,
      ...req.query
    }

    if (filter.optionDescription) {
      filter.optionDescription = new RegExp(`${filter.optionDescription}`, 'gi')
    }

    if (!filter.optionNumber) {
      filter.parentOpt = undefined
    }

    const results = await Option.find(filter)

    res.status(200).json({
      status: 'success',
      results
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    next(err)
  }
}

const getOptionById = async (req, res, next) => {
  const { id, virtualAssistantId } = req.params
  try {
    const option = await Option.find({ _id: id, virtualAssistant: virtualAssistantId })

    if (!option) {
      return res.status(404).json({
        status: 'fail',
        error: 'No option was found'
      })
    }

    res.status(200).json({
      status: 'success',
      option
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    next(err)
  }
}

const deleteOption = async (req, res, next) => {
  try {
    const doc = await Option.findByIdAndRemove(req.params.id)

    if (!doc) {
      return next(new Error('No option was found'))
    }

    if (doc.parentOpt) {
      await _removeChildReference(doc)
    }

    res.status(200).json({
      status: 'success',
      data: null
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    next(err)
  }
}

module.exports = {
  createOption,
  updateOption,
  getOptions,
  getOptionById,
  deleteOption
}
