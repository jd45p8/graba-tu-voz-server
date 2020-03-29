const User = require('../models/user');

/**
 * Método para creación de usuario.
 */
exports.create = function (req, res) {
  var user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  user.contact = req.body.contact;
  user.country = req.body.country;
  user.state = req.body.state;
  user.province = req.body.province;
  user.validate(() => {
    user.save(err => {
      if (err) {
        res.json(err);
      } else {
        res.json({
          message: 'Usuario creado',
          email: user.email
        });
      }
    });
  })
}