const User = require('../models/user');
const pinRegex = /^\d{4}$/


/**
 * Método para creación de usuario.
 */
exports.create = async function (req, res) {
  if ('pin' in req.body) {
    delete req.body['pin'];
  }

  if ('admin' in req.body) {
    delete req.body['admin'];
  }

  if ('tokens' in req.body) {
    delete req.body['tokens'];
  }

  let user = new User(req.body);

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
        case "pin":
          fieldShownName = "PIN";
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

/**
 * Método para activar el pin
 */
exports.enablePin = async function (req, res) {
  const user = req.user;
  
  if (!req.body.pin || !pinRegex.test(req.body.pin)) {
    return res.status(422).json({ message: 'El pin debe constar de 4 dígitos.' });
  }

  user.pin = req.body.pin;

  try {
    await user.save();
    res.status(200).json({ message: 'Pin activado exitosamente.' });
  } catch (error) {
    console.log(error);
    if (error.name == 'ValidatorError' || error.name == 'ValidationError') {
      let field = Object.keys(error.errors)[0];
      let message = 'Verifique el campo pin.';

      if (field == "pin") {
        message = 'Verifique la información ingresada';
      }
      res.status(422).json({
        message: message
      });
    } else {
      res.status(500).json({ message: 'Algo ha salido mal.' });
    }
  }
}

/**
 * Método para desactivar el pin
 */
exports.disablePin = async function (req, res) {
  const user = req.user;

  if (!user.pin) {
    return res.status(422).json({ message: 'El pin no está activado.' });
  }

  user.pin = undefined;
  try {
    await user.save();
    res.status(200).json({ message: 'Pin desactivado exitosamente.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo ha salido mal.' });
  }
}

/**
 * Método para obtener el estado del pin
 */
exports.pinStatus = async function (req, res) {
  const user = req.user;
  let status = 'enabled';
  
  if (user.pin == undefined) {
    status = 'disabled'
  }

  res.status(200).json({ status: status});  
} 