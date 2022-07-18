const express = require('express');
const router = express.Router();

const multer = require('../middleware/multer-config')
const auth = require('../middleware/auth/auth')
const sauceControllers = require('../controllers/sauce');

//endpoint pour récupérer toutes les sauces / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté.
router.get('/', auth, sauceControllers.getAllSauces)

//endpoint pour récupérer une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté.
router.get('/:id', auth, sauceControllers.getOneSauce)

//endpoint pour ajouter une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté / utilise le middleware multer pour gérer l'ajout d'un fichier.
router.post('/', auth, multer, sauceControllers.createSauce)

//endpoint pour mettre à jour une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté / utilise le middleware multer pour gérer la mise à jour d'un fichier.
router.put('/:id', auth, multer, sauceControllers.updateSauce)

//endpoint pour supprimer une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté.
router.delete('/:id', auth, sauceControllers.deleteSauce)

//endpoint pour ajouter un like ou un dislike pour une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté.
router.post('/:id/like', auth, sauceControllers.likeSauce)

module.exports = router;
