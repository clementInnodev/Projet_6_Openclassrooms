const mongoose = require('mongoose')

//création d'un modèle pour les sauces
const sauceSchema = mongoose.Schema({

  //l'id de l'utilisateur ayant créée la sauce
  userId : {
    type: String,
    required: true
  },

  //le nom de la sauce
  name : {
    type: String,
    required: true
  },

  //la marque de la sauce
  manufacturer : {
    type: String,
    required: true
  },

  //la decription de la sauce
  description : {
    type: String,
    required: true
  },

  //l'ingrédient principal
  mainPepper : {
    type: String,
    required: true
  },

  //l'image de la sauce
  imageUrl : {
    type: String,
    required: true
  },

  //
  heat : {
    type: Number,
    required: true
  },

  //nombres de likes
  likes : {
    type: Number,
    required: true
  },

  //nombres de dislikes
  dislikes : {
    type: Number,
    required: true
  },

  //l'id des utilisateurs qui like la sauce
  usersLiked : {
    type: [String],
    required: true
  },

  //l'id des utilisateurs qui dislike la sauce
  usersDisliked : {
    type: [String],
    required: true
  }
});

module.exports = mongoose.model('Sauce', sauceSchema);
