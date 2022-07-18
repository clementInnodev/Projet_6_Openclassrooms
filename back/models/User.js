const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({

  //email de l'utilisateur
  email : {
    type: String,
    required: true,
    unique: true
  },

  //mot de passe de l'utilisateur
  password : {
    type: String,
    required: true
  }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
