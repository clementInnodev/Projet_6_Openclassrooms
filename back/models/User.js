const mongoose = require('mongoose')

const userSchema = mongoose.Schema({

  //email de l'utilisateur
  email : {
    type: String,
    required: true
  },

  //mot de passe de l'utilisateur
  password : {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);
