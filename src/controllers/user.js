const User = require('../models/user');
const bcrypt = require('bcrypt');

/**
 * Método para creación de usuario.
 */
exports.create = async function (req, res) {
  var user = new User();
  if (!req.body.password || req.body.password.length < 8) {
    return res.json({
      "errors": {
        "password": {
          "kind": "minlength",
          "path": "password"
        }
      },
      "_message": "user validation failed",
      "name": "ValidationError"
    })
  }

  if (!process.env.BCRYPT_SALT_ROUNDS) {
    console.log("No se ha configurado BCRYPT_SALT_ROUNDS");
    res.status(500).send();
  }

  user.email = req.body.email;
  user.password = req.body.password;
  user.contact = req.body.contact;
  user.country = req.body.country;
  user.state = req.body.state;
  user.province = req.body.province;

  try {
    var hash = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_SALT_ROUNDS))
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }

  user.password = hash;

  try {
    await user.save();
    res.json({
      message: 'Usuario creado',
      email: user.email
    });
  } catch (error) {
    res.json(error);
  }
}