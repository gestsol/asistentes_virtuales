const { Router } = require('express');
const {
  createOption,
  updateOption,
  getOptions,
  deleteOption,
  getOptionById,
} = require('../controllers/option.controller');

const optionRouter = Router({ mergeParams: true });

/**
 * Middleware that prevents one document to have action and options fields in the same document
 */
optionRouter.use((req, res, next) => {
  let allowBody = true;

  if (req.method === 'POST' || req.method === 'PATCH') {
    allowBody = !(req.body.action && req.body.options);
  }

  if (!allowBody) {
    return next(
      new Error(
        `You can't have both fields 'action' and 'options' in the same document`
      )
    );
  }

  next();
});

optionRouter.route('/').get(getOptions).post(createOption);

optionRouter
  .route('/:id')
  .patch(updateOption)
  .delete(deleteOption)
  .get(getOptionById);

module.exports = optionRouter;
