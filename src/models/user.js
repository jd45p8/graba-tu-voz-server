const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;
const emailRegex = /^[\w-\.]{5,30}@uninorte.edu.co$/;
const gendesList = ["Hombre", "Mujer", "Otro"];
const minDate = new Date(new Date().setDate(new Date().getDate() - 365 * 90))
const maxDate = new Date(new Date().setDate(new Date().getDate() - 365 * 3));

/**
 * Esquema del usuario en la base de datos.
 */
const userSchema = new Schema({
  email: {
    type: String, unique: true, required: true, validate: {
      validator: function (email) {
        return emailRegex.test(email);
      }
    }
  },
  password: { type: String, required: true, minlength: 8 },
  birthdate: {
    type: Date,
    validate: {
      validator: function (birthdate) {
        return birthdate >= minDate && birthdate <= maxDate;
      }
    }
  },
  gender: {
    type: String,
    required: true,
    validate: {
      validator: function (gender) {
        return gendesList.includes(gender);
      }
    }
  },
  contact: { type: Boolean, required: true },
  country: {
    type: String, required: function () {
      return this.contact === true;
    },
    minlength: 1
  },
  state: {
    type: String, required: function () {
      return this.contact === true;
    },
    minlength: 1
  },
  province: {
    type: String, required: function () {
      return this.contact === true;
    },
    minlength: 1
  },
  pin: {
    type: String,
    minlength: 4
  },
  admin: {
    type: Boolean,
    default: false
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

/**
 * Middleware para eliminar los espacios en blanco al principio y al final antes de validar.
 */
userSchema.pre('validate', function (next) {
  const user = this;
  if (user.isModified('email')) {
    user.email = user.email.trim();
  }
  if (user.contact) {
    if (user.isModified('country')) {
      user.country = user.country.trim();
    }
    if (user.isModified('state')) {
      user.state = user.state.trim();
    }
    if (user.isModified('province')) {
      user.province = user.province.trim();
    }
  }
  next();
});

/**
 * Middleware para cifrar la contraseña antes de almacenarla.
 */
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_SALT_ROUNDS || 10));
  }

  if (user.pin) {
    if (user.isModified('pin')) {
      user.pin = await bcrypt.hash(user.pin, parseInt(process.env.BCRYPT_SALT_ROUNDS || 10));
    }
  }
});

/**
 * Método para generar el token de autenticación.
 */
userSchema.methods.generateAuthToken = async function () {
  if (process.env.JWT_KEY != undefined) {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, { algorithm: "HS256", expiresIn: "1d" });
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
  } else {
    throw new Error('Llave JWT inválida');
  }
}

/**
 * Método para verificar el PIN.
 */
userSchema.methods.comparePIN = async function (PIN) {
  const user = this;
  const PINMatch = await bcrypt.compare(PIN, user.pin);
  return PINMatch;
}

/**
 * Método para encontrar un usuario usando sus credenciales.
 */
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email: email });
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