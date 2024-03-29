const express = require('express');
const path = require('path')
const multer = require('multer')

const userRouter = require('./routes/user')
const sauceRouter = require('./routes/sauce')

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')

const app = express();


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

//permet de récupérer le JSON présent dans les requêtes reçues depuis le front
app.use(express.json());

app.use('/back/images',  express.static(path.join(__dirname, '/images')))

app.use('/api/auth', userRouter)
app.use('/api/sauces', sauceRouter)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

//errorHandler, gère toutes les erreurs throw dans le code
app.use((err, req, res, next) => {
  console.log(err)
  if(!('statusCode' in err)){
    err.statusCode = 500
  }
  let message = `${err.name}: ${err.message}`
  return res.status(err.statusCode).json({message})
});

//gère tout les requêtes http reçues qui ne correspondent pas aux endpoints définis et retourne une erreur 404
app.use( ({res}) => {
  const message = 'Impossible de trouver la ressource demandée. Vous pouvez essayer une autre URL.'
  res.status(404).json({message})
})



module.exports = app;
