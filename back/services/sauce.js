const Sauce = require('../models/Sauce')
const fs = require('fs')


exports.saveSauce = (req, res) => {
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


exports.updateWithFile = (req, res, sauceUpdated) => {
  Sauce.findOne({ _id: req.params.id })
    .then( sauce => {
      if(sauce.userId != req.auth.userId){
        const message = `Vous n'êtes pas autorisé à modifier cette sauce`
        return res.status(401).json({ message })
      }
      const filename = sauce.imageUrl.split('/images/')[1]
      fs.unlink(`back/images/${filename}`, () => {
        return Sauce.updateOne({ _id: req.params.id }, { ...sauceUpdated, _id: req.params.id})
        .then( () => {
          const message = `La sauce ${sauce.name} a été modifiée avec succès`
          res.json({ message, data: sauce })
        })
      })
    })
    .catch( error => res.status(500).json({ error }) )
}


exports.updateWithoutFile = (req, res, sauceUpdated) => {
  Sauce.findOne({ _id: req.params.id })
    .then( sauce => {
      if(sauce.userId != req.auth.userId){
        const message = `Vous n'êtes pas autorisé à modifier cette sauce`
        return res.status(401).json({ message })
      }
      return Sauce.updateOne({ _id: req.params.id }, { ...sauceUpdated, _id: req.params.id})
        .then( () => {
          const message = `La sauce ${sauce.name} a été modifiée avec succès`
          res.json({ message, data: sauce })
        })
    })
    .catch( error => res.status(500).json({ error }) )
  }


exports.like = (req,res) => {
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
