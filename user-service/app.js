const express = require('express');
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require('cookie-parser')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((err) => console.log('Connexion à MongoDB échouée !'+err));
 
const app = express();
app.use(express.json());
app.use(cookieParser())
app.use('/public',express.static(path.join(__dirname, 'public')))

const corsOptions = {
  origin: 'http://localhost:5173', // Origine autorisée
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
  credentials: true // Pour inclure les cookies et autres credentials
};

app.use(cors(corsOptions));
// api log

app.get("/", (req, res) => {
  res.status(200).send({ message: "api user_service is running!" });
})

//refresh token
app.get('/refreshToken', require('./controllers/refreshToken').refreshToken);
app.delete('/logout', require('./controllers/refreshToken').logout)

app.use('/', require('./routes/User.routes'))


module.exports = app;