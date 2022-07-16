const Sauce = require('../models/Sauce')
const fs = require('fs')


/**
 * Sauvegarde une nouvelle sauce en base de donnée.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.saveSauce = (req, res) => {

  //crée un objet JSON sauceObject
  const sauceObject = JSON.parse(req.body.sauce)

  //supprime la propriété '_id' de l'objet sauceObject
  delete sauceObject._id

  //crée une instance de l'objet Sauce via le model importé ligne 1
  const sauce = new Sauce({
    //décompose l'objet sauceObject avec ses propriétés dans la nouvelle instance de Sauce
    ...sauceObject,
    //ajoute ou modifie les dernières propriétés attendues par l'instance de Sauce
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  })

  //saucegarde la nouvelle sauce en bdd
  sauce.save()
    .then( sauce => {
      const message = `La sauce ${sauce.name} a été ajouté avec succès`
      res.json({ message, sauce })
    })
    .catch( error => res.status(500).json({ error }) )
}




/**
 * Met à jour une sauce en bdd avec une nouvelle image.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {sauceUpdated} sauceUpdated La nouvelle sauce à mettre à jour en bdd.
 */
exports.updateWithFile = (req, res, sauceUpdated) => {

  //récupère la sauce à mettre à jour
  Sauce.findOne({ _id: req.params.id })
    .then( sauce => {

      //si l'utilisateur qui tente de mettre à jour la sauce n'est pas le même que le créateur de la sauce, retourne une erreur d'autorisation
      if(sauce.userId != req.auth.userId){
        const message = `Vous n'êtes pas autorisé à modifier cette sauce`
        return res.status(401).json({ message })
      }

      //récupère le nom de l'image à supprimer
      const filename = sauce.imageUrl.split('/images/')[1]

      //supprime l'ancienne image de la sauce
      fs.unlink(`back/images/${filename}`, () => {
        //met à jour la sauce avec ses nouvelles propriétés
        return Sauce.updateOne({ _id: req.params.id }, { ...sauceUpdated, _id: req.params.id})
        .then( () => {
          const message = `La sauce ${sauce.name} a été modifiée avec succès`
          res.json({ message, data: sauce })
        })
      })
    })
    .catch( error => res.status(500).json({ error }) )
}




/**
 * Met à jour une sauce en bdd sans modification de l'image.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {sauceUpdated} sauceUpdated La nouvelle sauce à mettre à jour en bdd.
 */
exports.updateWithoutFile = (req, res, sauceUpdated) => {

  //récupère la sauce à mettre à jour
  Sauce.findOne({ _id: req.params.id })
    .then( sauce => {

      //si l'utilisateur qui tente de mettre à jour la sauce n'est pas le même que le créateur de la sauce, retourne une erreur d'autorisation
      if(sauce.userId != req.auth.userId){
        const message = `Vous n'êtes pas autorisé à modifier cette sauce`
        return res.status(401).json({ message })
      }

      //met à jour la sauce avec ses nouvelles propriétés
      return Sauce.updateOne({ _id: req.params.id }, { ...sauceUpdated, _id: req.params.id})
        .then( () => {
          const message = `La sauce ${sauce.name} a été modifiée avec succès`
          res.json({ message, data: sauce })
        })
    })
    .catch( error => res.status(500).json({ error }) )
  }




  /**
 * Ajoute ou supprime un like ou un dislike pour une sauce.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.like = (req,res) => {

  //l'id de l'utilisateur
  const userId = req.body.userId

  //le like de l'utilisateur ( 1 = like  /  -1 = dislike  /  0 = pas d'avis donné )
  const avis = parseInt(req.body.like)

  //récupère la sauce dont l'id est passé en paramètre
  Sauce.findOne({ _id: req.params.id })
  .then( sauce => {

    //si l'utilisateur like la sauce
    if(avis === 1){

      //si l'utilisateur avait un dislike sur cette sauce avant
      if(sauce.usersDisliked.includes(userId)){

        Sauce.updateOne({ _id: req.params.id }, {
          //ajoute l'userId au tableau des utilisateur aimant cette sauce en bdd
          $push: {
            usersLiked: userId
          },
          //retire l'userId au tableau des utilisateur n'aimant pas cette sauce en bdd
          $pull: {
            usersDisliked: userId
          },
          //incrémente le nombre total de likes et décrémente le nombre total de dislike pour cette sauce
          $inc: {
            likes: +1,
            dislikes: -1
          }
        }).then( () => {
            const message = `Votre like a été ajouté`
            res.json({ message })
        })
        .catch( error => res.status(500).json({ error }) )

      }else /*si l'utilisateur n'avait pas un dislike sur cette sauce avant*/ {

        Sauce.updateOne({ _id: req.params.id }, {
          //ajoute l'userId au tableau des utilisateur aimant cette sauce en bdd
          $push: {
            usersLiked: userId
          },
          //incrémente le nombre total de likes pour cette sauce
          $inc: {
            likes: +1
          }
        }).then( () => {
            const message = `Votre like a été ajouté`
            res.json({ message })
        })
        .catch( error => res.status(500).json({ error }) )
      }

    }else if(avis === -1) /*si l'utilisateur dislike la sauce*/{

      //et si l'utilisateur avait un like sur cette sauce avant
      if(sauce.usersLiked.includes(userId)){

        Sauce.updateOne({ _id: req.params.id }, {
          //ajoute l'userId au tableau des utilisateurs n'aimant pas cette sauce en bdd
          $push: {
            usersDisliked: userId
          },
          //retire l'userId au tableau des utilisateurs aimant cette sauce en bdd
          $pull: {
            usersLiked: userId
          },
          //incrémente le nombre total de dislikes et décrémente le nombre total de likes pour cette sauce
          $inc: {
            dislikes: +1,
            likes: -1
          }
        }).then( () => {
          const message = `Votre dislike a été ajouté`
          res.json({ message })
        })
        .catch( error => res.status(500).json({ error }) )

      } else /*si l'utilisateur n'avait pas un like sur cette sauce avant*/{

        Sauce.updateOne({ _id: req.params.id }, {
          //ajoute l'userId au tableau des utilisateurs n'aimant pas cette sauce en bdd
          $push: {
            usersDisliked: userId
          },
          //incrémente le nombre total de dislikes pour cette sauce
          $inc: {
            dislikes: +1
          }
        }).then( () => {
          const message = `Votre dislike a été ajouté`
          res.json({ message })
        })
        .catch( error => res.status(500).json({ error }) )
      }

    }else /*si l'utilisateur veut retirer son like ou son dislike pour cette sauce*/{

      //si l'utilisateur veut retirer son like pour cette sauce
      if(sauce.usersLiked.includes(userId)){

        Sauce.updateOne({ _id: req.params.id }, {
          //retire l'userId au tableau des utilisateurs aimant cette sauce en bdd
          $pull: {
            usersLiked: userId
          },
          //décrémente le nombre de likes total de cette sauce
          $inc: {
            likes: -1
          }
        }).then( () => {
          const message = `Votre like a été retiré`
          res.json({ message })
        })
        .catch( error => res.status(500).json({ error }) )
      }

      //si l'utilisateur veut retirer son dislike pour cette sauce
      if(sauce.usersDisliked.includes(userId)){

        return Sauce.updateOne({ _id: req.params.id }, {
          //retire l'userId au tableau des utilisateurs n'aimant pas cette sauce en bdd
          $pull: {
            usersDisliked: userId
          },
          //décrémente le nombre de dislikes total de cette sauce
          $inc: {
            dislikes: -1
          }
        }).then( () => {
          const message = `Votre dislike a été retiré`
          res.json({ message })
        })
        .catch( error => res.status(500).json({ error }) )
      }
    }
  })
  .catch( error => res.status(500).json({ error }) )
}
