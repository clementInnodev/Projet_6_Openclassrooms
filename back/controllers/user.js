const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const privateKey = require('../middleware/auth/private_key')

const User = require('../models/User');

exports.signup = (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then( hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      })
      return user.save()
        .then( () => {
          const message = `L'utilisateur ${req.body.email} a été créé !`
          res.json({ message })
        })
    })
    .catch( error => {
      if(error.name === 'ValidationError'){
        const message = `Cette adresse email est déjà utilisée.`
        return res.status(400).json({ message, error})
      }
      res.status(500).json({ error })
    })
}

exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
    .then( user => {
      if(!user){
        const message = `Paire utilisateur/mot de passe incorrecte`
        res.status(401).json({ message })
      } else {
        return bcrypt.compare(req.body.password, user.password)
          .then( valid => {
            if(!valid){
              const message = `Paire utilisateur/mot de passe incorrecte`
              res.status(401).json({ message })
            } else {
              const token = jwt.sign(
                { userId: user._id },
                privateKey,
                { expiresIn: '24h' }
              )
              return res.json({ userId: user._id, token })
            }
          })
      }
    })
    .catch( error => res.status(500).json({ error }) )
}
