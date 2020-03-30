const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Esquema del usuario en la base de datos.
 */
var userSchema = new Schema({
  email: {
    type: String, unique: true, required: true, validate: {
      validator: function (email) {
        return emailRegex.test(email);
      }
    }
  },
  password: { type: String, required: true, minlength: 8 },
  contact: { type: Boolean, required: true },
  country: {
    type: String, required: function () {
      return this.contact === true;
    }
  },
  state: {
    type: String, required: function () {
      return this.contact === true;
    }
  },
  province: {
    type: String, required: function () {
      return this.contact === true;
    }
  },
  joinDate: { type: Date, default: Date.now },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
});

/**
 * Middleware para cifrar la contraseña antes de almacenarla.
 */
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || 10));
  }
  next();
});

/**
 * Método para generar el token de autenticación.
 */
userSchema.methods.generateAuthToken = async function () {
  if (process.env.JWT_KEY != undefined) {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  } else {
    throw new Error('Llave JWT inválida');
  }
}

/**
 * Método para encontrar un suario usando sus credenciales.
 */
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ 'email': email });
  if (!user) {
    throw new Error('Credenciales inválidas.')
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Credenciales inválidas.')
  }

  return user;
}

const User = mongoose.model('User', userSchema);
module.exports = User;