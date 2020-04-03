const router = require('express').Router();
const phraseController = require('../controllers/phrase');
const userMiddleware = require('../middlewares/user');

/**
 * Ruta para agregar una frase.
 */
router.route('/phrase')
  .post(userMiddleware.authenticate,
    userMiddleware.admin,
    phraseController.create)

/**
 * Ruta para listar todas las frases
 */
router.route('/phrase/all')
  .get(userMiddleware.authenticate,
    phraseController.list)

/**
 * Ruta para eliminar una frase.
 */
router.route('/phrase/:_id')
  .delete(userMiddleware.authenticate,
    userMiddleware.admin,
    phraseController.remove);

module.exports = router;