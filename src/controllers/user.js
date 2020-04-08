const User = require('../models/user');


/**
 * Método para creación de usuario.
 */
exports.create = async function (req, res) {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).json({
      message: 'Usuario creado.',
      email: user.email
    });
  } catch (error) {
    console.log(error);

    if (error.code == 11000) {
      res.status(422).json({
        message: 'El usuario ya se encuentra registrado.'
      });
    } else if (error.name == 'ValidatorError' || error.name == 'ValidationError') {
      let field = Object.keys(error.errors)[0];
      let fieldShownName = "";
      switch (field) {
        case "email":
          fieldShownName = "correo";
          break;
        case "password":
          fieldShownName = "contraseña";
          break;
        case "birthdate":
          fieldShownName = "fecha de nacimiento (YYYY-MM-DD)";
          break;
        case "gender":
          fieldShownName = "género";
          break;
        case "country":
          fieldShownName = "país";
          break;
        case "state":
          fieldShownName = "estado/departamento";
          break;
        case "province":
          fieldShownName = "provincia/ciudad";
          break;
        default:
          fieldShownName = field;
          break;
      }
      res.status(422).json({
        message: `Verifique el campo ${fieldShownName}.`
      });
    } else {
      res.status(500).json({
        message: 'Algo ha salido mal.'
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
    res.status(200).json({ token })
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo ha salido mal.' });
  }
}

/**
 * Método para cerrar sesión de un usuario autenticado, eliminando un token.
 */
exports.logout = async function (req, res) {
  const { user, token } = req;
  user.tokens = user.tokens.filter(t => t.token != token);
  try {
    await user.save();
    res.status(200).json({ message: 'Se ha cerrado la sesión.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo ha salido mal.' });
  }
}

/**
 * Método para borrar todos los tokens asignados a un usuario.
 */
exports.logoutall = async function (req, res) {
  const { user, token } = req;
  user.tokens = [];
  try {
    await user.save();
    res.status(200).json({ message: 'Se han cerrado todas las sesiones.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo ha salido mal.' });
  }
}