const { Schema, model } = require('mongoose')

/**
 * El modelo de Assistant, representa los diferentes asistentes virtuales que
 * se pueden crear. Cada asistente virtual tendrá sus propias opciones.
 */

const virtualAssistantSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El campo <name> es requerido'],
    minlength: [3, 'El campo <name> debe contener al menos 3 caracteres'],
    maxlength: [24, 'EL campo <name> NO debe contener más de 24 caracteres']
  },
  phone: {
    type: String,
    validate: {
      validator: value => {
        // Validación de teléfono, ejemplo: +56912345678
        const regex = new RegExp(/^[+0-9]*$/)

        return regex.test(value)
      },
      message: props => `${props.value} no es un número de teléfono válido`
    },
    required: [true, 'El campo <phone> es requerido'],
    unique: true,
    // La longitud mínima debe ser de 9 caracteres (el simbolo "+" mas el numero de telefono)
    minlength: [9, 'El campo <phone> debe contener al menos 8 caracteres'],
    maxlength: [15, 'El campo <phone> NO debe contener más de 15 caracteres']
  },
  wasi_device_id: {
    type: String
  },
  wasi_token: {
    type: String
  }
})

module.exports.VirtualAssistant = new model('virtual_assistant', virtualAssistantSchema)
