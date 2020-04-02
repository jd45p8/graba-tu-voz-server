const router = require('express').Router();
const recordingController = require('../controllers/recording');
const multer = require('multer');
const multerErrorHandler = require('../errorHandlers/multer');

// Se almacenarán los archivos que se suban en buffers de memoria como objetos.
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype != 'audio/wav') {
      callback(new Error('WRONG_MIMETYPE'));
    } else {
      callback(null);
    }
  }
});

/**
 * Ruta para agregar grabaciones a la base de datos.
 */
router.route('/recording')
  .post(upload.single("file"), 
  recordingController.create,
  multerErrorHandler.fileSize,
  multerErrorHandler.fileCount,
  multerErrorHandler.mimeType,
  multerErrorHandler.error);

module.exports = router;