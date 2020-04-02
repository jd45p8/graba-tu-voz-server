const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Modelo para almacenar las grabaciones en la base de datos.
 */
const recordingSchema = new Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: function(email) {
        return emailRegex.test(email);
      }
    }
  },
  text: {
    type: String,
    required: true,
    minlength: 1
  },
  fileID: {
    type: String,
    required: true,
    minlength: 1,
    unique: true
  },
});

/**
 * Middleware para eliminar los espacios en blanco al principio y al final antes de validar.
 */
recordingSchema.pre('validate', function (next) {
  const recording = this;
  if (recording.isModified('email')) {
    recording.email = recording.email.trim();
  }
  if (recording.isModified('text')) {
    recording.text = recording.text.trim()
  }
  next();
});

module.exports = mongoose.model('Recording', recordingSchema);