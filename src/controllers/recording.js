const Recording = require('../models/recording');
const Phrase = require('../models/phrase');
const AWS = require('aws-sdk');
const md5 = require('md5');

/**
 * Método para la creación de grabaciones.
 */
exports.create = async function (req, res) {
  if (!req.file) {
    return res.status(422).json({ message: 'No se ha anexado ningún archivo.' });
  }

  const recording = new Recording(req.body);
  recording.email = req.user.email;

  const s3Bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  try {
    recording.fileID = `${md5(req.file.buffer)}.wav`;
    const result = await Phrase.findOne({ text: recording.text });
    if (!result) {
      throw new Error('PHRASE_NOT_FOUND');
    }
    // Guardar la información del archivo en la base de datos.
    await recording.save();

    // Subir el archivo a S3.
    await s3Bucket.putObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: recording.fileID,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }).promise();
    res.status(201).json({ message: 'Se subió el archivo con éxito.' });
  } catch (error) {
    console.log(error);

    if (error.code == 11000) {
      res.status(422).json({ message: 'El archivo ya existe.' });
    } else if (error.name == 'ValidatorError' || error.name == 'ValidationError') {
      res.status(422).json({ message: 'Verifique la información ingresada.' });
    } else if (error.message = 'PHRASE_NOT_FOUND') {
      res.status(422).json({ message: 'Frase inexistente.' });
    } else {
      res.status(500).json({ message: 'Algo ha salido mal.' });
    }
  }
}