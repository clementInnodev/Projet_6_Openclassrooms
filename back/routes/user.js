const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userControllers = require('../controllers/user');
const User = require('../models/User');

//endpoint pour ajouter un utilisateur.
router.post(
    '/signup',
    [ 
        body('email')
            .trim()
            .escape()
            .normalizeEmail()
            .notEmpty().withMessage('Veuillez renseigner un email.')
            .isEmail().withMessage('Veuillez renseigner un email valide.')
            .custom( async (value, {req}) => {
                const alreadyUsed = await User.findOne({email: value})
                if(alreadyUsed){
                    const error = new Error('Adresse email déjà utilisée.')
                    throw error
                }
                return true
            }), 
        body('password')
            .notEmpty().withMessage('Veuillez renseigner un mot de passe.')
    ],
    userControllers.signup
);

//endpoint pour connecter un utilisateur.
router.post(
    '/login',
    [
        body('email')
            .trim()
            .escape()
            .normalizeEmail()
            .notEmpty().withMessage('Veuillez renseigner un email.')
            .isEmail().withMessage('Veuillez renseigner un email valide.'),
        body('password')
            .notEmpty().withMessage('Veuillez renseigner un mot de passe.')
    ],
    userControllers.login
);

module.exports = router;
