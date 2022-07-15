const Sauce = require('../models/Sauce')
const fs = require('fs')

exports.getAllSauces = (req, res) =>{
  Sauce.find()
  .then( sauces => {
    res.json( sauces )
  })
  .catch( error => res.status(500).json({ error }) )
}

exports.getOneSauce = (req, res) =>{
  Sauce.findOne({_id: req.params.id})
    .then( sauce => {
      if(sauce === null){
        const message = `La sauce n°${req.params.id} n'existe pas.`
        return res.status(400).json({ message })
      }
      res.json( sauce )
    })
    .catch( error => res.status(500).json({ error }) )
}

exports.createSauce = (req, res) =>{
  const sauceObject = JSON.parse(req.body.sauce)
  delete sauceObject._id
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  })
  sauce.save()
    .then( sauce => {
      const message = `La sauce ${sauce.name} a été ajouté avec succès`
      res.json({ message, sauce })
    })
    .catch( error => res.status(500).json({ error }) )
}

exports.updateSauce = (req, res) =>{
    const id = req.params.id
    if(req.file){
      const sauceUpdated = {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
      console.log(sauceUpdated)
      delete sauceUpdated.userId
      Sauce.findOne({ _id: id })
        .then( sauce => {
          if(sauce.userId != req.auth.userId){
            const message = `Vous n'êtes pas autorisé à modifier cette sauce`
            return res.status(401).json({ message })
          }
          const filename = sauce.imageUrl.split('/images/')[1]
          fs.unlink(`back/images/${filename}`, () => {
            return Sauce.updateOne({ _id: id }, { ...sauceUpdated, _id: id})
            .then( () => {
              const message = `La sauce ${sauce.name} a été modifiée avec succès`
              res.json({ message, data: sauce })
            })
          })
        })
        .catch( error => res.status(500).json({ message, error }) )
    } else {
      const sauceUpdated = {
        ...req.body
      }
      delete sauceUpdated.userId
      Sauce.findOne({ _id: id })
        .then( sauce => {
          if(sauce.userId != req.auth.userId){
            const message = `Vous n'êtes pas autorisé à modifier cette sauce`
            return res.status(401).json({ message })
          }
          return Sauce.updateOne({ _id: id }, { ...sauceUpdated, _id: id})
            .then( () => {
              const message = `La sauce ${sauce.name} a été modifiée avec succès`
              res.json({ message, data: sauce })
            })
        })
        .catch( error => res.status(500).json({ error }) )
    }
}

exports.deleteSauce = (req, res) =>{
  const id = req.params.id
  Sauce.findOne({ _id: id })
  .then( sauce => {
    if (sauce.userId != req.auth.userId){
      const message = `Vous n'êtes pas autorisé à supprimer cette sauce`
      res.status(401).json({ message })
    } else {
      const filename = sauce.imageUrl.split('/images/')[1]
      fs.unlink(`back/images/${filename}`, () => {
        return Sauce.deleteOne({ _id: id })
        .then( () => {
          const message = `La sauce ${sauce.name} a été supprimé avec succès`
          res.json({ message, data: sauce })
        })
      })
    }
  })
  .catch( error => res.status(500).json({ error }) )
}

exports.likeSauce = (req, res) =>{
  const userId = req.body.userId
  const avis = parseInt(req.body.like)
  Sauce.findOne({ _id: req.params.id })
  .then( sauce => {
    if(avis === 1){
      console.log(sauce)
      let newTabs = [...sauce.usersLiked]
      newTabs.push(userId)
      const sauceObject = {
        ...sauce,
        usersLiked: newTabs
      }
      console.log(sauceObject)
      return Sauce.updateOne({ _id: req.params.id }, {
        $push: {
          usersLiked: userId
        },
        $inc: {
          likes: +1
        }
       }).then( () => {
          const message = `Votre like a été ajouté`
          res.json({ message })
        })
    }else if(avis === -1){
      return Sauce.updateOne({ _id: req.params.id }, {
      $push: {
        usersDisliked: userId
      },
      $inc: {
        dislikes: +1
      }
    }).then( () => {
      const message = `Votre dislike a été ajouté`
      res.json({ message })
    })
    }else{
      if(sauce.usersLiked.includes(userId)){
        return Sauce.updateOne({ _id: req.params.id }, {
          $pull: {
            usersLiked: userId
          },
          $inc: {
            likes: -1
          }
        }).then( () => {
          const message = `Votre like a été retiré`
          res.json({ message })
        })
      }
      if(sauce.usersDisliked.includes(userId)){
        return Sauce.updateOne({ _id: req.params.id }, {
          $pull: {
            usersDisliked: userId
          },
          $inc: {
            dislikes: -1
          }
        }).then( () => {
          const message = `Votre dislike a été retiré`
          res.json({ message })
        })
      }
    }
  })
  .catch( error => res.status(500).json({ error }) )
}
