const express = require('express');
const db = require('./db')
const path = require('path')

const userRouter = require('./routes/user')
const sauceRouter = require('./routes/sauce')

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')

const app = express();

//permet de récupérer le JSON présent dans les requêtes reçues depuis le front
app.use(express.json());

//middleware pour fixer les erreurs COR
app.use((req, res, next) => {
  //donne la possibilité d'accéder à l'API depuis toutes les origines
  res.setHeader('Access-Control-Allow-Origin', '*');
  //ajoute les headers utiles pour les requêtes envoyées à l'API
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  //accepte le type de requête http listées
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/auth', userRouter)
app.use('/api/sauces', sauceRouter)
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

//gère tout les requêtes http reçues qui ne correspondent pas aux endpoints définis et retourne une erreur 404
app.use( ({res}) => {
  const message = 'Impossible de trouver la ressource demandée. Vous pouvez essayer une autre URL.'
  res.status(404).json({message})
})

module.exports = app;
