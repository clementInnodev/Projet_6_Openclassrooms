const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const privateKey = require('../middleware/auth/private_key')

const User = require('../models/User');


/**
 * Ajoute un utilisateur à la base de donnée (inscription).
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.addUser = (req, res) => {

  //hash le mot de passe de l'utilisateur avant de l'insérer en bdd pour la sécurité
  bcrypt.hash(req.body.password, 10)
    .then( hash => {

      //crée un objet user contenant l'identifiant et le mot de passe hashé de l'utilisateur
      const user = new User({
        email: req.body.email,
        password: hash
      })

      //ajoute l'utilisateur à la bdd
      return user.save()
        .then( () => {
          const message = `L'utilisateur ${req.body.email} a été créé !`
          res.json({ message })
        })
    })
    .catch( error => {
      //vérifie si l'erreur vient d'un problème d'unicité de l'adresse mail renseignée par l'utilisateur.
      if(error.name === 'ValidationError'){
        //retourne une erreur à l'utilisateur en indiquant que le problème est que l'adresse mail qu'il a renseigné est déjà utilisée.
        const message = `Cette adresse email est déjà utilisée.`
        return res.status(400).json({ message, error})
      }
      res.status(500).json({ error })
    })
}



/**
 * Connecte un utilisateur.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.logon = (req, res) => {

  //récupère les données de l'utilisateur présentes dans la bdd en fonction de l'email renseigné.
  User.findOne({ email: req.body.email })
    .then( user => {

      //si l'adresse email renseigné pour la connexion n'est pas présent dans la bdd retourne une erreur.
      if(!user){

        const message = `Paire utilisateur/mot de passe incorrecte`
        res.status(401).json({ message })

      } else {

        //compare le mot de passe renseigné lors de la connexion avec celui présent en bdd grâce à bcrypt.
        return bcrypt.compare(req.body.password, user.password)
          .then( valid => {

            //si le mot de passe n'est pas valide retourne une erreur.
            if(!valid){

              const message = `Paire utilisateur/mot de passe incorrecte`
              res.status(401).json({ message })

            } else /*si le mot de passe est valide*/{

              //crée un token d'identification grace au module jwt qui comprend l'id de l'utilisateur.
              //Il est crypté grâce à une clé privée et renseignée dans un autre fichier et a une durée de vie de 24h.
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
