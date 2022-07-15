const express = require('express');
const db = require('./db')
const path = require('path')

const userRouter = require('./routes/user');
const sauceRouter = require('./routes/sauce');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/auth', userRouter)
app.use('/api/sauces', sauceRouter)
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use( ({res}) => {
  const message = 'Impossible de trouver la ressource demandée. Vous pouvez essayer une autre URL.'
  res.status(404).json({message})
})

module.exports = app;
