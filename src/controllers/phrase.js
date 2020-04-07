const Phrase = require('../models/phrase');

/**
 * Agrega la frase a la base de datos.
 */
exports.create = async function (req, res) {
  const phrase = new Phrase(req.body);

  try {
    await phrase.save()
    res.status(201).json({ message: 'Frase añadida.' })
  } catch (error) {
    console.log(error);

    if (error.code == 11000) {
      res.status(422).json({ message: 'La frase ya existe.' });
    } else if (error.name == 'ValidatorError' || error.name == 'ValidationError') {
      res.status(422).json({ message: 'Verifique la información ingresada.' });
    } else {
      res.status(500).json({ message: 'Algo ha salido mal.' });
    }
  }
}

/**
 * Elimina la frase de la base de datos.
 */
exports.remove = async function (req, res) {
  try {
    const result = await Phrase.deleteOne({ _id: req.params._id });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Frase eliminada.' });
    } else {
      res.status(404).json({ message: 'No se puede eliminar un elemento inexistente.' });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: 'Algo ha salido mal.' });
  }
}

/**
 * Lista todas las frases de la base de datos.
 */
exports.list = async function (req, res) {
  try {
    const phrases = await Phrase.find({});
    res.status(200).json(phrases.map(f => {
      return {
        _id: f._id,
        text: f.text,
        maxRecordings: process.env.MAX_RECORDINGS_PER_PHRASE
      };
    }));
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: 'Algo ha salido mal.' });
  }
}