const User = require('../models/user');
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar si el usuario que realiza la petición actual se encuentra autenticado.
 */
exports.authenticate = async function(req, res, next){
  const token = req.header('Authorization').replace('Bearer ', '');
  const data = jwt.verify(token, process.env.JWT_KEY);
  
  const user = await User.findOne({_id: data._id, 'tokens.token': token});
  if (!user) {
    return res.status(401).json({message: 'No está autorizado para realizar esta solicitud.'});
  }

  req.user = user;
  req.token = token;
  next()  
}