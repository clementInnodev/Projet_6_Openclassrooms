const jwt = require('jsonwebtoken')
const privateKey = require('./private_key')

module.exports = (req, res, next) => {

  //sauvegarde dans une variable le token de l'utilisateur.
  const authorizationHeader = req.headers.authorization

  //si le token n'est pas renseigné dans la req, retourne une erreur.
  if(!authorizationHeader){
    const message = `Veuillez vous connecter puis réssayez.`
    return res.status(401).json({ message })
  }

  //sauvegarde uniquement la partie unique du token de l'utilisateur.
  const token = authorizationHeader.split(' ')[1]

  //décode et vérifie le token de l'utilisateur.
  jwt.verify(token, privateKey, (error, decodedToken) => {

    //si le token n'est pas bon retourne une erreur
    if(error) {
      const message = `L'utilisateur n'est pas autorisé à accèder à cette ressource.`
      return res.status(401).json({ message, data: error })
    }

    //récupère l'id de l'utilisateur présente dans le token.
    const userId = decodedToken.userId

    //renseigne le token de l'utilisateur dans la propriété auth de la requête.
    req.auth = {
      userId: userId
    };

    //vérifie si l'id de l'utilisateur dans le corps de la requête correspond bien avec celui présent dans le token d'identification.
    if (req.body.userId && (req.body.userId !== userId)) {
      //retourne une erreur si les id's ne match pas.
      const message = `L'identifiant de l'utilisateur est invalide.`
      return res.status(401).json({ message })
    } else {
      next()
    }
  })
}
