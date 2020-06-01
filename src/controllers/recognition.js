const Phrase = require('../models/phrase');
const User = require('../models/user');
const FormData = require('form-data');
const axios = require('axios');
const stream = require('stream');

/**
 * Estima a que hablante pertenecen los audios recibidos.
 */
exports.speaker = async function (req, res) {
    let speaker_predictions = null;
    let phrases_prediction = null;

    let form = new FormData();
    form.append(`${req.file.fieldname}`, req.file.buffer, {
        filename: `${req.file.fieldname}`,
        contentType: req.file.mimetype
    });
    form.append('phraseSamples', req.body.phraseSamples);

    // Estimación del hablante
    try {
        response = await axios({
            method: 'POST',
            url: `${process.env.MODELS_SERVER_API}/speaker`,
            data: form,
            headers: form.getHeaders()
        });
        speaker_predictions = response.data
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            message: 'No se pudo estimar el hablante'
        })    
    }

    form = new FormData()
    form.append(`${req.file.fieldname}`, req.file.buffer, {
        filename: `${req.file.fieldname}`,
        contentType: req.file.mimetype
    });
    form.append('phraseSamples', req.body.phraseSamples);

    // Estimación del habla
    try {
        response = await axios({
            method: 'POST',
            url: `${process.env.MODELS_SERVER_API}/character`,
            data: form,
            headers: form.getHeaders()
        });
        phrases_prediction = response.data
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            message: 'No se pudo estimar las frases.'
        });   
    }
    
    let texts = [];
    let probabilities = [];
    phrases_prediction.map(({label, probability}) => {
        texts.push(label)
        probabilities.push(probability)
    });

    // Si se tiene algún valor ocn probabilidad menor al 70% no se puede determinar el PIN.
    if (probabilities.some(val => val < 0.70)) {
        return res.status(200).json({
            speakers: speaker_predictions,
            texts: texts.map((text, index) => {
                return {
                    label: text,
                    probability: probabilities[index]
                }
            }),
            message: "No se pudo reconocer el PIN."
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
    speaker_predictions.map(element => {
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

    // Se selecciona el usuario con mayor probabilidad que tenga el PIN indicado.
    selected = null;
    for (let email of emails) {
        for (let user of users) {
            if (user.pin && user.email == email && await user.comparePIN(pin)) {
                selected = email;
                break;
            }
        }

        if (selected != null) {
            break;
        }
    }

    res.status(200).json({
        speakers: speaker_predictions,
        texts: texts.map((text, index) => {
            return {
                label: text,
                probability: probabilities[index],
            }
        }),
        selectedSpeaker: selected,
        message: "Finalizado"
    })
}