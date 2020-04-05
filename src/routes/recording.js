const router = require('express').Router();
const recordingController = require('../controllers/recording');
const multer = require('multer');
const multerErrorHandler = require('../errorHandlers/multer');
const userMiddleware = require('../middlewares/user');

// Se almacenarán los archivos que se suban en buffers de memoria como objetos.
const storage = multer.memoryStorage();
const allowedTypes = ['audio/wave', 'audio/wav'];
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      callback(new Error('WRONG_MIMETYPE'));
    } else {
      callback(null, true);
    }
  }
});

/**
 * Ruta para agregar grabaciones a la base de datos.
 */
router.route('/recording')
  .post(userMiddleware.authenticate,
    upload.single("file"),
    recordingController.create,
    multerErrorHandler.fileSize,
    multerErrorHandler.fileCount,
    multerErrorHandler.mimeType,
    multerErrorHandler.error)

/**
 * Ruta para listar las grabaciones de un usuario.
 */
router.route('/recording/list')
  .get(userMiddleware.authenticate,
    recordingController.listUserRecordings)

/**
 * Ruta para descargar y eliminar grabaciones de un usuario.
 */
router.route('/recording/:_id')
  .get(userMiddleware.authenticate,
    recordingController.download)
  .delete(userMiddleware.authenticate,
    recordingController.remove);

module.exports = router;