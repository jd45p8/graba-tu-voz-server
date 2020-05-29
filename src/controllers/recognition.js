const Phrase = require('../models/phrase');
const User = require('../models/user');
const FormData = require('form-data');
const axios = require('axios');
const stream = require('stream');

/**
 * Estima a que hablante pertenecen los audios recibidos.
 */
exports.speaker = async function (req, res) {
    files = req.files;
    let speaker_predictions = null;
    let phrases_prediction = null;

    let form = new FormData()
    files.map((file, index) => {
        form.append(`${file.fieldname}${index}`, file.buffer, {
            filename: `${file.fieldname}${index}`,
            contentType: file.mimetype
        })
    });

    // Estimación del hablante
    try {
        speaker_predictions = await axios({
            method: 'POST',
            url: `${process.env.MODELS_SERVER_API}/speaker`,
            data: form,
            headers: form.getHeaders()
        });

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            message: 'No se pudo estimar el hablante'
        })    
    }

    form = new FormData()
    files.map((file, index) => {
        form.append(`${file.fieldname}${index}`, file.buffer, {
            filename: `${file.fieldname}${index}`,
            contentType: file.mimetype
        })
    });

    // Estimación del habla
    try {
        phrases_prediction = await axios({
            method: 'POST',
            url: `${process.env.MODELS_SERVER_API}/character`,
            data: form,
            headers: form.getHeaders()
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            message: 'No se pudo estimar las frases.'
        });   
    }
    
    let texts = [];
    let probabilities = [];
    files.map((file, index) => {
        texts.push(phrases_prediction.data[`${file.fieldname}${index}`].label)
        probabilities.push(phrases_prediction.data[`${file.fieldname}${index}`].probability)
    });

    // Si se tiene algún valor ocn probabilidad menor al 70% no se puede determinar el PIN.
    if (probabilities.some(val => val < 0.70)) {
        return res.status(200).json({
            speaker: speaker_predictions.data,
            texts: texts.map((text, index) => {
                return {
                    label: text,
                    probability: probabilities[index]
                }
            }),
            warning: "No pudo estimarse todos los caracteres del PIN con una probabiliad aceptable(70%)."
        })
    }

    // Se obtienen las frases para obtener la equivalencia en carácter y por tanto el PIN.
    let phrases = null;
    try {
        phrases = await Phrase.find({
            text: {$in: texts} 
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'No se pudo obtener la equivalencia de las frases.'
        });
    }

    let pin = "";
    texts.map(text => {
        for (phrase of phrases) {
            if (text == phrase.text) {
                pin += phrase.character;
                break;
            }
        }
    });

    // Se obtienen los usuarios que se indentificaron anteriormente cuya probabilidad es igual o superior al 70%
    emails = [];
    speaker_predictions.data.forEach(element => {
        if (element.probability >= 0.7) {
            emails.push(element.label);
        }
    });

    try{
        users = await User.find({
            email: {$in: emails}
        });
    } catch {
        console.log(error);
        return res.status(500).json({
            message: 'No se pudo obtener los usuarios.'
        });
    }

    // Se slecciona el usuario con mayor probabilidad que tenga el PIN indicado.
    selected = null;
    for (email in emails) {
        for (user in users) {
            if (user.pin && user.email == email && user.comparePIN(pin)){
                selected = email;
            }
        }
    }

    res.status(200).json({
        speaker: speaker_predictions.data,
        texts: texts.map((text, index) => {
            return {
                label: text,
                probability: probabilities[index]
            }
        }),
        selectedSpeaker: selected
    })
}