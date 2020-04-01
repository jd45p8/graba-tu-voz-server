const router = require('express').Router();
const userController = require('../controllers/user');
const userMiddleware = require('../middlewares/user');

/**
 * Ruta en la API para crear un nuevo usuario.
 */
router.route('/user')
  .post(userController.create);

/**
 * Ruta para la autenticación de usuarios.
 */
router.route('/login')
  .post(userController.login);

/**
 * Ruta para cerrar una sesión de un usuario, eliminando un token.
 */
router.route('/logout')
  .post(userMiddleware.authenticate, userController.logout);

/**
 * Ruta para cerrar todas las sesiones de un usuario, eliminando todos sus tokens.
 */
router.route('/logoutall')
  .post(userMiddleware.authenticate, userController.logoutall);

module.exports = router;