const Sauce = require('../models/Sauce')


/**
 * Récupère toutes les sauces.
 */
exports.getAll = async () => {

  const sauces = await Sauce.find()

  return sauces

}


/**
 * Récupère une sauce.
 *
 * @param {sauceId} string L'id de la sauce à récupérer.
 */
exports.getOne = async (sauceId) => {

  const sauce = await Sauce.findById(sauceId)

  if(!sauce){
    const error = new Error('Sauce introuvable.')
    error.statusCode = 404
    throw error
  }

  return sauce

}


/**
 * Sauvegarde une nouvelle sauce en base de donnée.
 *
 * @param {sauceData} object Les données de la nouvelle sauce à créer.
 */
exports.create = async (sauceData) => {

  const sauce = new Sauce({
    ...sauceData
  })

  await sauce.save()

  return `La sauce ${sauce.name} a été ajouté avec succès`

}


/**
 * Met à jour une sauce.
 *
 * @param {sauceId} string L'id de la sauce à update.
 * @param {sauceData} object Les nouvelles données de la sauce à modifier.
 */
exports.update = async (sauceId, sauceData) => {

  await Sauce.updateOne({_id: sauceId}, {
    ...sauceData
  })

  const message = 'Post mis à jour avec succès.'
  
  return message
  
}



/**
 * Supprime une sauce.
 *
 * @param {sauceId} string L'id de la sauce à supprimer.
 */
exports.delete = async (sauceId) => {

        await Sauce.deleteOne({_id: sauceId})

        const message = `La sauce a été supprimée avec succès`

        return message

}


/**
 * Ajoute le like pour une sauce et enlève un précédent dislike si existe.
 *
 * @param {sauce} object La sauce à modifier.
 * @param {userId} string L'id de l'utilisateur ayant like la sauce.
 */
exports.like = async (sauce, userId) => {

  const alreadyLiked = sauce.usersLiked.includes(userId)

  if(alreadyLiked){
      const error = new Error('Vous avez déjà like cette sauce.')
      error.statusCode = 400
      error.name = errorName.validation
      throw error
  }

  const wasDislike = sauce.usersDisliked.includes(userId)

  let config

  if(wasDislike){
    
    config = {
      $push: {
        usersLiked: userId
      },
      $pull: {
        usersDisliked: userId
      },
      $inc: {
        likes: +1,
        dislikes: -1
      }
    }

  }else{

    config = {
      $push: {
        usersLiked: userId
      },
      $inc: {
        likes: +1
      }
    }

  }

  await Sauce.updateOne({_id: sauce._id}, config)

  const message = 'Votre like a été ajouté avec succès.'

  return message

}



/**
 * Ajoute le dislike de l'utilisateur et enlève un précédent like si existe.
 *
 * @param {sauce} object La sauce à modifier.
 * @param {userId} string L'id de l'utilisateur ayant like la sauce.
 */
exports.dislike = async (sauce, userId) => {

  const alreadyDisliked = sauce.usersDisliked.includes(userId)

  if(alreadyDisliked){
    const error = new Error('Vous avez déjà dislike cette sauce.')
    error.statusCode = 400
    error.name = errorName.validation
    throw error
  }

  const wasLike = sauce.usersLiked.includes(userId)

  let config

  if(wasLike){

    config = {
      $push: {
        usersDisliked: userId
      },
      $pull: {
        usersLiked: userId
      },
      $inc: {
        likes: -1,
        dislikes: +1
      }
    }

  }else{

    config = {
      $push: {
        usersDisliked: userId
      },
      $inc: {
        dislikes: +1
      }
    }

  }

  await Sauce.updateOne({_id: sauce._id}, config)

  const message = 'Votre like a été ajouté avec succès.'

  return message

}



/**
 * Supprime le like ou le dislike de l'utilisateur.
 *
 * @param {sauce} object La sauce à modifier.
 * @param {userId} string L'id de l'utilisateur ayant like la sauce.
 */
exports.unLike = async (sauce, userId) => {

  let config
  let action

  const wasLike = sauce.usersLiked.includes(userId)

  if(wasLike){
    config = {
      $pull: {
        usersLiked: userId
      },
      $inc: {
        likes: -1
      }
    }

    action = 'unLike'
  }

  const wasDislike = sauce.usersDisliked.includes(userId)

  if(wasDislike){
    config = {
      $pull: {
        usersDisliked: userId
      },
      $inc: {
        dislikes: -1
      }
    }

    action = 'unDislike'
  }

  await Sauce.updateOne({_id: sauce.id}, config)

  const message = `Vous avez ${action} la sauce avec succès.`

  return message

}