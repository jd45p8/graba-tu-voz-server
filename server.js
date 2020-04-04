const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./src/routes/user');
const recordingRouter = require('./src/routes/recording');
const phraseRouter = require('./src/routes/phrase');

const port = process.env.PORT || 8080;
const dbDir = `${process.env.DB_PREFIX}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`;

const app = express();
app.use(cors());

// Middleware para convertir en objetos la información de todas las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));

mongoose.connect(dbDir, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  dbName: process.env.DB_NAME
}).then(() => {
  console.log('Conectado a la base de datos de forma exitosa.');
}).catch((error) => {
  console.log(error);
});

app.use(userRouter);
app.use(recordingRouter);
app.use(phraseRouter);

app.listen(port, () => {
  console.log(`Corriendo en puerto ${port}`);
});