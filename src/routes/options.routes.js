const { Router } = require('express')
const {
  createOption,
  updateOption,
  getOptions,
  deleteOption,
  getOptionById
} = require('../controllers/option.controller')

const router = Router({ mergeParams: true })
const optionRouter = Router({ mergeParams: true })

/**
 * Middleware to concatenate friendly route
 */
router.use('/:virtualAssistantId/options', optionRouter)

/**
 * Middleware that prevents one document to have action and options fields in the same document
 */
optionRouter.use((req, _, next) => {
  let allowBody = true

  if (req.method === 'POST' || req.method === 'PATCH') {
    allowBody = !(req.body.action && req.body.options)
  }

  if (!allowBody) {
    return next(new Error(`You can't have both fields 'action' and 'options' in the same document`))
  }

  next()
})

optionRouter.route('/').get(getOptions).post(createOption)
optionRouter.route('/:id').get(getOptionById).patch(updateOption).delete(deleteOption)

module.exports = { optionRoutes: router }
