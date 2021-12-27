/* eslint-disable no-prototype-builtins */
const _ = require("lodash");
const { options } = require("../app");
const Option = require("../models/option.model");

const _validateParentOpt = async (parentOptStr) => {
  const parentOpt = await Option.findById(parentOptStr);

  if (!parentOpt || !parentOpt.options) {
    throw new Error("Invalid parentOpt");
  }

  return parentOpt;
};

/**
 * Recibe un arreglo de ids de opciones y los asocia a una opcion padre.
 * @param  {ObjectId} parentOptId id de la opcion padre
 * @param  {array<ObjectId>} childrenIds ids de opciones hijas que se quieren asociar al padre
 */
const associateMultipleChildsToParent = async (parentOpt, childrenIds) => {
  // encontrar los childrenIds validos y que sean unicos
  const validChildrenIds = await Option.find({ _id: { $in: childrenIds } }).then(results => {
    return _.uniq(results.map(r => r._id.toString()));
  });

  await Option.updateMany({_id: { $in: validChildrenIds }}, { parentOpt: parentOpt._id });

  const parentOptions = parentOpt.options && parentOpt.options.map(childOpt => childOpt.toString());

  const allChildren = parentOptions ? _.uniq([...parentOptions, ...validChildrenIds]) : validChildrenIds;

  return allChildren;
};

const removeParentOpt = async (parentOptId) => {
  const children = await Option.find({ parentOptId });
  const promises = children.map(child => {
    child.parentOpt = undefined;
    return child.save();
  });

  return Promise.all(promises);
}

const createOption = async (req, res, next) => {
  try {
    let parentOpt;

    if (req.body.parentOpt) {
      parentOpt = await _validateParentOpt(req.body.parentOpt);
    }

    const option = await Option.create(req.body);

    if (req.body.options?.length) {
      const optionChildren = await associateMultipleChildsToParent(
        option,
        req.body.options
      );
      option.options = optionChildren;
      await option.save();
      await option.populate("options");
    }

    if (parentOpt) {
      parentOpt.options.push(option);
      await parentOpt.save({ validateBeforeSave: true });
    }

    res.status(201).json({
      status: "success",
      option,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

const removeChildReference = (child) =>
  Option.updateOne(
    { _id: child.parentOpt },
    {
      $pullAll: {
        options: [child._id],
      },
    }
  );

const updateOption = async (req, res, next) => {
  try {
    const body = { ...req.body };
    const doc = await Option.findById(req.params.id);
    let parentOpt;

    if (!doc) {
      return next(new Error(`Option with id ${req.params.id} does not exist`));
    }

    if (body.parentOpt) {
      parentOpt = await _validateParentOpt(body.parentOpt);
    }

    if ((!doc.options && !doc.action || doc.options) && body.options) {
      // si el documento que se quiere actualizar tiene options, es decir, si es un parentOpt
      // de otras opciones, eliminar esa relacion de las opciones hijas.
      if (doc.options) {
        await removeParentOpt(doc._id);
      }
      
      body.options = _.uniq(body.options);
      const childrenOptions = await associateMultipleChildsToParent(doc._id, body.options);
      doc.options = childrenOptions;
      await doc.populate('options');
    }

    Object.keys(body).forEach((key) => {
      // No modificar parentOpt si se quiere eliminar, es decir, si viene como null en el body.
      // Esta operacion se hara posteriormente.
      if (key === "parentOpt" && !body[key]) {
        return;
      }

      if (key === "options") {
        return;
      }

      doc[key] = body[key];
    });

    // Si se recibe parentOpt en el body como un falsy value, quiere decir que se quiere eliminar la
    // la relacion.
    if (body.hasOwnProperty("parentOpt") && !body.parentOpt) {
      await removeChildReference(doc);
      doc.parentOpt = undefined;
    }

    await doc.save({ validateBeforeSave: true });

    if (parentOpt) {
      parentOpt.options.push(doc);
      await parentOpt.save({ validateBeforeSave: true });
    }

    res.status(200).json({
      status: "success",
      option: doc,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

const getOptions = async (req, res, next) => {
  try {
    let filter = req.query;

    if (filter.optionDescription) {
      filter = {
        ...filter,
        optionDescription: new RegExp(`${filter.optionDescription}`, "gi"),
      };
    }

    const results = await Option.find(filter);

    res.status(200).json({
      results,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

const getOptionById = async (req, res, next) => {
  try {
    const option = await Option.findById(req.params.id);

    if (!option) {
      return res.status(404).json({
        status: "fail",
        error: "No option was found",
      });
    }

    res.status(200).json({
      status: "success",
      option,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

const deleteOption = async (req, res, next) => {
  try {
    const doc = await Option.findByIdAndRemove(req.params.id);

    if (!doc) {
      return next(new Error("No option was found"));
    }

    if (doc.parentOpt) {
      await removeChildReference(doc);
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    res.status(400).json({
      status: "fail",
      error: err.message,
    });
  }
};

module.exports = {
  createOption,
  updateOption,
  getOptions,
  getOptionById,
  deleteOption,
};
