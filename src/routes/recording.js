const router = require('express').Router();
const recordingController = require('../controllers/recording');
const multer = require('multer');

// Se almacenarán los archivos que se suban en buffers de memoria como objetos.
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**
 * Ruta para agregar grabaciones a la base de datos.
 */
router.route('/recording')
  .post(upload.single("file"), recordingController.create);

module.exports = router;