const mongoose = require('mongoose')

module.exports = mongoose.connect('mongodb+srv://Clement:projet6@cluster0.3t6fs19.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'))
