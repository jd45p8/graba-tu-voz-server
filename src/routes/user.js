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

/**
 * Ruta para activar el PIN para reconocimiento de voz de un usuario.
 */
router.route('/pin/enable')
  .post(userMiddleware.authenticate, userController.enablePin)

/**
 * Ruta para desactivar el PIN para reconocimiento de voz de un usuario.
 */
router.route('/pin/disable')
  .post(userMiddleware.authenticate, userController.disablePin)

/**
 * Ruta para obtener el estado del PIN (activado o desactivado)
 */
router.route('/pin/status')
  .get(userMiddleware.authenticate, userController.pinStatus)

module.exports = router;