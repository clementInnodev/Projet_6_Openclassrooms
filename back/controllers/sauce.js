const Sauce = require('../models/Sauce')
const sauceServices = require('../services/sauce')
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
  const sauce = req.body.sauce
  const errorTabs = []

  if(!sauce.name || sauce.name === ''){
    errorTabs.push('name')
  }else if(!sauce.manufacturer || sauce.manufacturer === ''){
    errorTabs.push('manufacturer')
  }else if(!sauce.description || sauce.description === ''){
    errorTabs.push('description')
  }else if(!sauce.mainPepper || sauce.mainPepper === ''){
    errorTabs.push('main pepper ingredient')
  }else if(!sauce.heat || sauce.heat === 0){
    errorTabs.push('heat')
  }else if(!req.file){
    errorTabs.push('image')
  }

  if(errorTabs.length === 1){
    const message = `La requête est incomplète, veuillez renseigner le champ ${errorTabs[0]}.`
    return res.status(400).json({ message })
  }
  if(errorTabs.length > 1){
    const message = `La requête est incomplète, veuillez renseigner les champs ${errorTabs.join(', ')}.`
    return res.status(400).json({ message })
  }

  sauceServices.saveSauce(req, res)
}

exports.updateSauce = (req, res) =>{
  let sauceUpdated={}

  if(req.file){
    sauceUpdated = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
  }else{
    sauceUpdated = {
      ...req.body
    }
  }
  delete sauceUpdated.userId

  const errorTabs = []

  if(!sauceUpdated.name || sauceUpdated.name === ''){
    errorTabs.push('name')
  }else if(!sauceUpdated.manufacturer || sauceUpdated.manufacturer === ''){
    errorTabs.push('manufacturer')
  }else if(!sauceUpdated.description || sauceUpdated.description === ''){
    errorTabs.push('description')
  }else if(!sauceUpdated.mainPepper || sauceUpdated.mainPepper === ''){
    errorTabs.push('main pepper ingredient')
  }else if(!sauceUpdated.heat || sauceUpdated.heat === 0){
    errorTabs.push('heat')
  }

  if(errorTabs.length === 1){
    const message = `La requête est incomplète, veuillez renseigner le champ ${errorTabs[0]}.`
    return res.status(400).json({ message })
  }
  if(errorTabs.length > 1){
    const message = `La requête est incomplète, veuillez renseigner les champs ${errorTabs.join(', ')}.`
    return res.status(400).json({ message })
  }

  if(sauceUpdated.imageUrl){
    sauceServices.updateWithFile(req, res, sauceUpdated)
  }else{
    sauceServices.updateWithoutFile(req, res, sauceUpdated)
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
  if((!req.body.userId || req.body.userId === '') || (!req.body.like || req.body.like === '')){
    const message = `La requête est incomplète`
    return res.status(400).json({ message })
  }

  sauceServices.like(req, res)
}
