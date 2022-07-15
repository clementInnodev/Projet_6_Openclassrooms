const express = require('express');
const router = express.Router();

const multer = require('../middleware/multer-config')
const auth = require('../middleware/auth/auth')
const sauceControllers = require('../controllers/sauce');

router.get('/', auth, sauceControllers.getAllSauces)
router.get('/:id', auth, sauceControllers.getOneSauce)
router.post('/', auth, multer, sauceControllers.createSauce)
router.put('/:id', auth, multer, sauceControllers.updateSauce)
router.delete('/:id', auth, sauceControllers.deleteSauce)
router.post('/:id/like', auth, sauceControllers.likeSauce)

module.exports = router;
