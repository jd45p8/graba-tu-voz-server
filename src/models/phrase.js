const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Modelo para almacenar las frases que serán grabadas, en la base de datos.
 */
const phraseSchema = new Schema({
  text: {
    type: String,
    minlength: 1,
    required: true,
    unique: true
  },
  createdDate: { type: Date, default: Date.now }
});

/**
 * Middleware para eliminar los espacios en blanco al principio y al final antes de validar.
 */
phraseSchema.pre('validate', function(next) {
  const phrase = this;
  if (phrase.isModified('text')){
    phrase.text = phrase.text.trim();
  }
  next()
})

module.exports = new mongoose.model('Phrase', phraseSchema);