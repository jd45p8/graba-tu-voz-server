const mongoose = require('mongoose');
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
  joinDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('user', userSchema);