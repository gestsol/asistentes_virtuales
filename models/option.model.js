/* eslint-disable new-cap */
const { Schema, model } = require('mongoose');

/**
 *
 * @param {String} value
 * Valida que el campo {options} no esté presente si ya está el campo action
 */
function actionFieldValidator(value) {
  if (value && this.options) {
    return false;
  }

  return true;
}

/**
 *
 * @param {Array} value
 * Valida que el campo {action} no esté presente si ya está el campo options
 */
function optionsFieldValidator(options) {
  if (options && options.length && this.action) {
    return false;
  }

  return true;
}

const optionSchema = new Schema({
  optionNumber: {
    type: Number,
    required: [true, 'optionNumber field is required'],
    unique: true,
  },
  optionDescription: {
    type: String,
    required: [true, 'optionDescription field is required'],
  },
  action: {
    type: String,
    validate: [
      actionFieldValidator,
      `You must define the field 'action' or 'options', but not both`,
    ],
  },
  options: {
    type: [
      {
        type: Schema.ObjectId,
        ref: 'Option',
      },
    ],
    default: undefined,
    validate: [
      optionsFieldValidator,
      `You must define the field 'action' or 'options', but not both`,
    ],
  },
  parentOpt: {
    type: Schema.ObjectId,
    ref: 'Option',
    default: undefined,
  },
});

optionSchema.pre('save', function (next) {
  if (this.action) {
    this.options = undefined;
  }

  next();
});

optionSchema.pre(/^find/, function (next) {
  this.populate('options');
  next();
});

const Option = new model('Option', optionSchema);

module.exports = Option;
