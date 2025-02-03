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

//refresh token
app.get('/api/refreshToken', require('./controllers/refreshToken').refreshToken);
app.delete('/logout', require('./controllers/refreshToken').logout)

app.use('/api/user', require('./routes/User.routes'))
app.use('/api/product', require('./routes/Product.routes'))
app.use('/api/category', require('./routes/Category.routes'))


module.exports = app;