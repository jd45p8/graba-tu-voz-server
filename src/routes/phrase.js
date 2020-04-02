const router = require('express').Router();
const phraseController = require('../controllers/phrase');
const userMiddleware = require('../middlewares/user');

/**
 * Ruta para agregar una frase.
 */
router.route('/phrase')
  .get(userMiddleware.authenticate,
    phraseController.list)
  .post(userMiddleware.authenticate,
    userMiddleware.admin,
    phraseController.create)

router.route('/phrase/:_id')
  .delete(userMiddleware.authenticate,
    userMiddleware.admin,
    phraseController.remove);

module.exports = router;