const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/user');

//endpoint pour ajouter un utilisateur.
router.post('/signup', userControllers.signup);

//endpoint pour connecter un utilisateur.
router.post('/login', userControllers.login);

module.exports = router;
