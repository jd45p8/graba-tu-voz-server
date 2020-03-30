const router = require('express').Router();
const userController = require('../controllers/user');

/**
 * Rutas en la API para trabajar sobre la colección de usuarios.
 */
router.route('/user')
  .post(userController.create);

/**
 * Ruta para la autenticación de usuarios.
 */
router.route('/login')
  .post(userController.login);

module.exports = router;