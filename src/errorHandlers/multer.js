/**
 * Handler para dar respuesta cuando el archivo excede el tamaño máximo.
 */
exports.fileSize = function (err, req, res, next) {
  if (err.code == 'LIMIT_FILE_SIZE') {
    console.log(err);
    return res.status(422).json({ message: 'El archivo es muy grande.' });
  }
  next(err);

}

/**
 * Handler para dar respuesta cuado se envía más de un archivo.
 */
exports.fileCount = function (err, req, res, next) {
  if (err.code == 'LIMIT_FILE_COUNT') {
    console.log(err);
    return res.status(422).json({ message: 'Demasiados archivos.' });
  }
  next(err);
}

/**
 * Handler para dar respuesta cuado se envía más de un archivo.
 */
exports.mimeType = function (err, req, res, next) {
  if (err.message == 'WRONG_MIMETYPE') {
    console.log(err);
    return res.status(422).json({ message: 'Tipo de archivo errado.' });
  }
  next(err);
}

/**
 * Handler para cualquier otro error.
 */
exports.error = function(err, req, res, next) {
  if (err) {
    console.log(err);
    return res.status(500).json({ message: 'Algo ha salido mal.'})
  }
}