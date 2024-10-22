const Recording = require('../models/recording');
const Phrase = require('../models/phrase');
const AWS = require('aws-sdk');
const md5 = require('md5');
const mmBuffer = require('music-metadata').parseBuffer;

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
    let metadata = await mmBuffer(req.file.buffer, req.file.mimetype);
    recording.duration = metadata.format.duration;

    recording.fileID = `${md5(req.file.buffer)}.wav`;
    let phrase = await Phrase.findOne({ text: recording.text });
    if (!phrase) {
      throw new Error('PHRASE_NOT_FOUND');
    }

    let countPhraseRecordings = await Recording.countDocuments({
      email: recording.email,
      text: recording.text
    });
    if (countPhraseRecordings >= process.env.MAX_RECORDINGS_PER_PHRASE) {
      throw new Error('MAX_RECORDINGS_REACHED');
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
    } else if (error.message == 'PHRASE_NOT_FOUND') {
      res.status(422).json({ message: 'Frase inexistente.' });
    } else if (error.message == 'MAX_RECORDINGS_REACHED') {
      res.status(422).json({ message: 'Suficientes grabaciones para esta frase.' })
    } else {
      res.status(500).json({ message: 'Algo ha salido mal.' });
    }
  }
}

/**
 * Método para la eliminación de grabaciones.
 */
exports.remove = async function (req, res) {
  if (!req.params._id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ message: 'Grabación no encontrada.' });
  }

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
        duration: recording.duration
      }
    }));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo ha salido mal.' });
  }
}