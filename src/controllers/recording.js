const Recording = require('../models/recording');

/**
 * Método para la creación de grabaciones.
 */
exports.create = function(req, res) {
  const recording = new Recording(req.body);

}