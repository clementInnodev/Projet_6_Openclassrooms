const mongoose = require('mongoose')

const dbName = 'Clement'
const mdp = 'projet6'

//connexion à la base de donnée mongoDB
module.exports = mongoose.connect(`mongodb+srv://${dbName}:${mdp}@cluster0.3t6fs19.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'))
