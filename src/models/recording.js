const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Modelo para almacenar las grabaciones en la base de datos.
 */
var recordingSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true
    },
    fileID: {
        type: String,
        required: true
    },
});


module.exports = mongoose.model('Recording', recordingSchema);