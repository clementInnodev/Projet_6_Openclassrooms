const express = require('express');
const router = express.Router();
const multer = require('../utils/multer-config')
const auth = require('../middleware/auth')
const transformBody = require('../middleware/transform-body')
const sauceControllers = require('../controllers/sauce');
const { body, param } = require('express-validator');

//endpoint pour récupérer toutes les sauces / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté.
router.get(
    '/',
    auth,
    sauceControllers.getAllSauces
)

//endpoint pour récupérer une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté.
router.get(
    '/:id',
    [
        param('id')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner l\'id du post en paramètre de l\'url.')
    ],
    auth,
    sauceControllers.getOneSauce
)

//endpoint pour ajouter une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté / utilise le middleware multer pour gérer l'ajout d'un fichier.
router.post(
    '/',
    auth,
    multer, 
    transformBody,
    [
        body('name')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un name')
            .isString().withMessage('Veuillez renseigner un name valide'),
        body('manufacturer')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un manufacturer')
            .isString().withMessage('Veuillez renseigner un manufacturer valide'),
        body('description')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un description')
            .isString().withMessage('Veuillez renseigner un description valide'),
        body('mainPepper')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un main pepper')
            .isString().withMessage('Veuillez renseigner un main pepper valide'),
        body('userId')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un userId')
            .isString().withMessage('Veuillez renseigner un userId valide'),
        body('heat')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un heat')
            .isNumeric().withMessage('Veuillez renseigner un heat valide'),
    ],
    sauceControllers.createSauce
)

//endpoint pour mettre à jour une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté / utilise le middleware multer pour gérer la mise à jour d'un fichier.
router.put(
    '/:id',
    auth,
    multer,
    transformBody,
    [
        body('name')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un name')
            .isString().withMessage('Veuillez renseigner un name valide'),
        body('manufacturer')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un manufacturer')
            .isString().withMessage('Veuillez renseigner un manufacturer valide'),
        body('description')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un description')
            .isString().withMessage('Veuillez renseigner un description valide'),
        body('mainPepper')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un main pepper')
            .isString().withMessage('Veuillez renseigner un main pepper valide'),
        body('heat')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner un heat')
            .isNumeric().withMessage('Veuillez renseigner un heat valide'),
        param('id')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner l\'id du post en paramètre de l\'url.')
    ],
    sauceControllers.updateSauce
)

//endpoint pour supprimer une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté.
router.delete(
    '/:id',
    auth,
    [
        param('id')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner l\'id du post en paramètre de l\'url.')
    ],
    sauceControllers.deleteSauce
)

//endpoint pour ajouter un like ou un dislike pour une sauce / utilise le middleware auth permettant de vérifier que l'utilisateur est bien connecté.
router.post(
    '/:id/like',
    auth,
    [
        body('userId')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner l\'userId.'),
        body('like')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner une valeur de like.')
            .isNumeric().withMessage('Veuillez renseigner une valeur de like valide')
            .custom((value, {req}) => {
                if(+value !== 1 && +value !== -1 && +value !== 0){
                    const error = new Error('Veuillez sélectionner une valeur de like valide (1 -> like; -1 -> dislike, 0 -> unlike / undislike).')
                    throw error
                }
                return true
            }),
        param('id')
            .trim()
            .escape()
            .notEmpty().withMessage('Veuillez renseigner l\'id du post en paramètre de l\'url.')
    ],
    sauceControllers.likeSauce
)

module.exports = router;
