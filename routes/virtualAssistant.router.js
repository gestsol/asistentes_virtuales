const { Router } = require("express");
const {
  getVirtualAssistants,
  createVirtualAssistant,
  getVirtualAssistantById,
} = require("../controllers/virtualAssistant.controller");
const optionRouter = require("./options.router");

const virtualAssistantRouter = Router();

virtualAssistantRouter.use('/:virtualAssistantId/options', optionRouter);

virtualAssistantRouter
  .route("/")
  .post(createVirtualAssistant)
  .get(getVirtualAssistants);

virtualAssistantRouter.route("/:id").get(getVirtualAssistantById)

module.exports = virtualAssistantRouter;