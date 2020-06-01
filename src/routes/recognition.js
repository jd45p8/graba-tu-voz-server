const router = require('express').Router();
const recognitionController = require('../controllers/recognition');
const multer = require('multer');
const multerErrorHandler = require('../errorHandlers/multer');
const userMiddleware = require('../middlewares/user');

// Se almacenarán los archivos que se suban en buffers de memoria como objetos.
const storage = multer.memoryStorage();
// Solo se permiten archivos Wav.
const wavMimeTypes = ['audio/wav', 'audio/wave', 'audio/vnd.wave', 'audio/x-wav'];
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!wavMimeTypes.includes(file.mimetype)) {
      callback(new Error('WRONG_MIMETYPE'));
    } else {
      if (file.mimetype != wavMimeTypes[0]){
        file.mimetype = wavMimeTypes[0];
      }
      callback(null, true);
    }
  }
});

/**
 * Ruta para agregar grabaciones a la base de datos.
 */
router.route('/recognition/speaker')
  .post(userMiddleware.authenticate,
    userMiddleware.admin,
    upload.single("file"),
    recognitionController.speaker,
    multerErrorHandler.fileSize,
    multerErrorHandler.fileCount,
    multerErrorHandler.mimeType,
    multerErrorHandler.error)

module.exports = router;