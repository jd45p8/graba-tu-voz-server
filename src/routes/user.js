const router = require('express').Router();
const userController = require('../controllers/user');

/**
 * Rutas en la API relacionadas con el usuario
 */
router.route('/user')
  .post(userController.create);

module.exports = router;