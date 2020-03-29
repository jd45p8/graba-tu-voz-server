const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRouter = require('./src/routes/user');

const port = process.env.PORT || 8080;
const dbDir = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`;

const app = express();

// Middleware para convertir en objetos la información de todas las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(dbDir, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  dbName: process.env.DB_NAME
}).then(() => {
  console.log('Conectado a la base de datos de forma exitosa.');
}).catch((error) => {
  console.error(error);
});

app.use(userRouter);

app.listen(8080, () => {
  console.log(`Corriendo en puerto ${port}`);
});