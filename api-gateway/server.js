const express = require('express');
const dotenv = require('dotenv');
const setupProxy = require('./routes/proxy');
const bodyParser = require("body-parser")
const morgan = require('morgan')
dotenv.config()

const app = express()

app.use(bodyParser.json());

// Middleware pour parser les données URL-encoded (optionnel)
app.use(bodyParser.urlencoded({ extended: true }));

// configuration des proxys
setupProxy(app)


//vérifier la santé de l'api gateway
app.get('/health', (req, res) =>res.send("API Gateway is running"))

app.use(morgan('combined')) // afficher les logs détaillés

const port = process.env.PORT;

app.listen(port, ()=>{
    console.log(`API Gatteway running on port: ${port}`)
})