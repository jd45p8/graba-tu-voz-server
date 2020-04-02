const router = require('express').Router();
const phraseController = require('../controllers/phrase');
const userMiddleware = require('../middlewares/user');

/**
 * Ruta para agregar una frase.
 */
router.route('/phrase')
  .post(userMiddleware.authenticate,
    userMiddleware.admin,
    phraseController.create);

module.exports = router;