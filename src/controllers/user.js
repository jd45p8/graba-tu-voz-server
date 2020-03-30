const User = require('../models/user');


/**
 * Método para creación de usuario.
 */
exports.create = async function (req, res) {
  const user = new User();

  user.email = req.body.email;
  user.password = req.body.password;
  user.contact = req.body.contact;
  user.country = req.body.country;
  user.state = req.body.state;
  user.province = req.body.province;

  try {
    await user.save();
    res.json({
      message: 'Usuario creado',
      email: user.email
    });
  } catch (error) {
    console.log(error);

    if (error.code == 11000) {
      res.status(422).json({
        message: 'El usuario ya se encuentra registrado.'
      });
    } else if (error.name == 'ValidatorError') {
      res.status(422).json({
        message: 'Verifique que la información ingresada.'
      });
    } else {
      res.status(500).json({
        message: 'Algo ha salido mal'
      });
    }
  }
}

/**
 * Método para la inicio de sesión de los usuarios.
 */
exports.login = async function (req, res) {
  let user;
  try {
    user = await User.findByCredentials(req.body.email, req.body.password);
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  try {
    const token = await user.generateAuthToken();
    res.json({ token })
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Algo ha salido mal.' });
  }
}