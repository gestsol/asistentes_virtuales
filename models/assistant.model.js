const { Schema, model } = require('mongoose');

/**
 * El modelo de Assistant, representa los diferentes asistentes virtuales que
 * se pueden crear. Cada asistente virtual tendrá sus propias opciones.
 */

const virtualAssistantSchema = new Schema({
  name: {
    type: String,
    required: [true, "El campo <name> es requerido"],
    minlength: [3, 'El campo <name> debe contener al menos 3 caracteres'],
    maxlength: [24, 'EL campo <name> NO debe contener más de 24 caracteres']
  },
  phone: {
    type: String,
    validate: {
      validator: function (value) {
        return /^[0-9]*$/.test(value);
      },
      message: props => `${props.value} no es un número de teléfono válido`
    },
    required: [true, "El campo <phone> es requerido"],
    unique: true,
    minlength: [8, 'El campo <phone> debe contener al menos 8 caracteres']
  },
  wasi_device_id: {
    type: String
  },
  wasi_token: {
    type: String
  }
});

const VirtualAssistant = new model('virtual_assistant', virtualAssistantSchema);

module.exports = VirtualAssistant;