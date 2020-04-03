const Recording = require('../models/recording');
const Phrase = require('../models/phrase');
const AWS = require('aws-sdk');
const md5 = require('md5');

const s3Bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});


/**
 * Método para la creación de grabaciones.
 */
exports.create = async function (req, res) {
  if (!req.file) {
    return res.status(422).json({ message: 'No se ha anexado ningún archivo.' });
  }

  const recording = new Recording(req.body);
  recording.email = req.user.email;

  try {
    recording.fileID = `${md5(req.file.buffer)}.wav`;
    const result = await Phrase.findOne({ text: recording.text });
    if (!result) {
      throw new Error('PHRASE_NOT_FOUND');
    }

    await recording.validate();

    // Subir el archivo a S3.
    await s3Bucket.putObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${req.user.email}/${recording.fileID}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }).promise();

    // Guardar la información del archivo en la base de datos.
    await recording.save();

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

/**
 * Método para la eliminación de grabaciones.
 */
exports.remove = async function (req, res) {
  const recording = await Recording.findOne({ email: req.user.email, _id: req.params._id });
  if (!recording) {
    return res.status(422).json({ message: 'El archivo no existe o no eres su propietario.' });
  }

  try {
    // Eliminar elemento de S3.
    await s3Bucket.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${req.user.email}/${recording.fileID}`
    }).promise();
    // Eliminar elemento de la base de datos.
    await Recording.deleteOne({ _id: recording._id });
    res.status(200).json({ message: 'La grabación se ha eliminado.' })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo ha salido mal. ' });
  }
}

/**
 * Descargar una grabación de un usuario.
 */
exports.download = async function (req, res) {
  const recording = await Recording.findOne({ _id: req.params._id, email: req.user.email });
  if (!recording) {
    return res.status(422).json({ message: 'El archivo no existe o no eres su propietario.' });
  }

  try {
    const object = await s3Bucket.getObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${recording.email}/${recording.fileID}`
    });
    const fileStream = object.createReadStream();
    fileStream.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo ha salido mal.' })
  }
}

/**
 * Listar todas las grabaciones de un usuario.
 */
exports.listUserRecordings = async function (req, res) {
  try {
    const recordings = await Recording.find({ email: req.user.email });
    res.status(200).json(recordings.map(recording => {
      return {
        _id: recording._id,
        text: recording.text,
      }
    }));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo ha salido mal.' });
  }
}