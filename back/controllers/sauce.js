const Sauce = require('../models/Sauce')
const sauceServices = require('../services/sauce')
const fs = require('fs')


/**
 * récupère toutes les sauces présente dans la base de donnée
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.getAllSauces = (req, res) =>{
  Sauce.find()
  .then( sauces => {
    res.json( sauces )
  })
  .catch( error => res.status(500).json({ error }) )
}


/**
 * récupère la sauce avec l'id passé en paramètre
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.getOneSauce = (req, res) =>{
  Sauce.findOne({_id: req.params.id})
    .then( sauce => {
      // Vérifie si la sauce avec l'id fourni existe bien
      if(sauce === null){
        const message = `La sauce n°${req.params.id} n'existe pas.`
        return res.status(404).json({ message })
      }
      res.json( sauce )
    })
    .catch( error => res.status(500).json({ error }) )
}


/**
 * Vérifie le contenu de la requête pour la création d'une sauce.
 * Si la requête correspond à ce qui est attendu, appel la fonction saveSauce() pour ajouter la sauce à la bdd.
 * Sinon retourne un status 400 et un message d'erreur approprié.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.createSauce = (req, res) =>{
  //création de l'objet JSON 'sauce'
  const sauce = {
    ...JSON.parse(req.body.sauce)
  }

  //création du tableau qui contiendra la liste des différentes erreurs éventuelles
  const errorTabs = []

  //vérification de toutes les erreurs possibles et ajout au tableau listant les erreurs
  if(!sauce.name || sauce.name === ''){
    errorTabs.push('name')
  }
  if(!sauce.manufacturer || sauce.manufacturer === ''){
    errorTabs.push('manufacturer')
  }
  if(!sauce.description || sauce.description === ''){
    errorTabs.push('description')
  }
  if(!sauce.mainPepper || sauce.mainPepper === ''){
    errorTabs.push('main pepper ingredient')
  }
  if(!sauce.heat || sauce.heat === 0){
    errorTabs.push('heat')
  }
  if(!req.file){
    errorTabs.push('image')
  }

  //traitement des erreurs trouvées
  if(errorTabs.length === 1){
    const message = `La requête est incomplète, veuillez renseigner le champ ${errorTabs[0]}.`
    return res.status(400).json({ message })
  }
  if(errorTabs.length > 1){
    const message = `La requête est incomplète, veuillez renseigner les champs ${errorTabs.join(', ')}.`
    return res.status(400).json({ message })
  }

  //appel de la fonction saveSauce()
  sauceServices.saveSauce(req, res)
}


/**
 * Vérifie le contenu de la requête pour la mise à jour d'une sauce.
 * Si la requête correspond à ce qui est attendu, appel la fonction updateWithFile() ou updateWithoutFile() pour modifier la sauce.
 * Sinon retourne un status 400 et un message d'erreur approprié.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.updateSauce = (req, res) =>{
  let sauceUpdated={}

  //vérifie si la requête contient une nouvelle image et crée la nouvelle sauce en fonction
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

  //supprime la propriété userId de la nouvelle sauce
  delete sauceUpdated.userId

  //création du tableau qui contiendra la liste des différentes erreurs éventuelles
  const errorTabs = []

  //vérification de toutes les erreurs possibles et ajout au tableau listant les erreurs
  if(!sauceUpdated.name || sauceUpdated.name === ''){
    errorTabs.push('name')
  }
  if(!sauceUpdated.manufacturer || sauceUpdated.manufacturer === ''){
    errorTabs.push('manufacturer')
  }
  if(!sauceUpdated.description || sauceUpdated.description === ''){
    errorTabs.push('description')
  }
  if(!sauceUpdated.mainPepper || sauceUpdated.mainPepper === ''){
    errorTabs.push('main pepper ingredient')
  }
  if(!sauceUpdated.heat || sauceUpdated.heat === 0){
    errorTabs.push('heat')
  }

  //traitement des erreurs trouvées
  if(errorTabs.length === 1){
    const message = `La requête est incomplète, veuillez renseigner le champ ${errorTabs[0]}.`
    return res.status(400).json({ message })
  }
  if(errorTabs.length > 1){
    const message = `La requête est incomplète, veuillez renseigner les champs ${errorTabs.join(', ')}.`
    return res.status(400).json({ message })
  }

  //vérifie si la sauce modifiée contient une nouvelle image ou non
  if(sauceUpdated.imageUrl){
    //si la sauce contient une nouvelle image, appel de la fonction updateWithFile()
    sauceServices.updateWithFile(req, res, sauceUpdated)
  }else{
    //si la sauce ne contient pas de nouvelle image, appel de la fonction updateWithoutFile()
    sauceServices.updateWithoutFile(req, res, sauceUpdated)
  }
}


/**
 * Supprime la sauce dont l'id est passé en paramètre.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.deleteSauce = (req, res) =>{
  //l'id de la sauce à supprimer
  const id = req.params.id
  //récupère la sauce en question
  Sauce.findOne({ _id: id })
  .then( sauce => {
    //vérifie si l'utilisateur qui récupère la sauce n'est pas celui qui l'a créée initialement
    if (sauce.userId != req.auth.userId){
      //si ce n'est pas le même utilisateur retourne une erreur d'autorisation
      const message = `Vous n'êtes pas autorisé à supprimer cette sauce`
      res.status(401).json({ message })
    } else {
      //si c'est le même utilisateur
      const filename = sauce.imageUrl.split('/images/')[1]
      //supprime l'image de la sauce dans le dossier
      fs.unlink(`back/images/${filename}`, () => {
        //puis supprime la sauce de la base de donnée
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


/**
 * Vérifie le contenu de la requête pour la gestion des likes et dislikes pour les sauces.
 * Si la requête correspond à ce qui est attendu, appel la fonction sauceServices() pour ajouter/retirer un likes ou un dislikes sur une sauce.
 * Sinon retourne un status 400 et un message d'erreur approprié.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.likeSauce = (req, res) =>{
  if((!req.body.userId || req.body.userId === '') || (!req.body.like || req.body.like === '')){
    const message = `La requête est incomplète`
    return res.status(400).json({ message })
  }

  sauceServices.like(req, res)
}
