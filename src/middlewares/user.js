const User = require('../models/user');
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar si el usuario que realiza la petición actual se encuentra autenticado.
 */
exports.authenticate = async function (req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).json({ message: 'Debe iniciar sesión para continuar.' });
  }
  const token = req.header('Authorization').replace('Bearer ', '');
  let user;

  try {
    const data = jwt.verify(token, process.env.JWT_KEY);

    user = await User.findOne({ _id: data._id, 'tokens.token': token });
    if (!user) {
      throw new Error('Usuario no encontrado.')
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Debe iniciar sesión para continuar.' });
  }

  req.user = user;
  req.token = token;
  next()
}

/**
 * Middleware para verificar si el usuario tiene permisos de administrador.
 */
exports.admin = function (req, res, next) {
  if (!req.user.admin) {
    return res.status(403).json({ message: 'No está autorizado para realizar esta solicitud.' });
  }

  next()
}