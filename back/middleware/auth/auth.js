const jwt = require('jsonwebtoken')
const privateKey = require('./private_key')

module.exports = (req, res, next) => {
  const authorizationHeader = req.headers.authorization

  if(!authorizationHeader){
    const message = `Veuillez vous connecter puis réssayez.`
    return res.status(401).json({ message })
  }

  const token = authorizationHeader.split(' ')[1]
  jwt.verify(token, privateKey, (error, decodedToken) => {
    if(error) {
      const message = `L'utilisateur n'est pas autorisé à accèder à cette ressource.`
      return res.status(401).json({ message, data: error })
    }

    const userId = decodedToken.userId

    req.auth = {
      userId: userId
    };

    if (req.body.userId && (req.body.userId !== userId)) {
      const message = `L'identifiant de l'utilisateur est invalide.`
      return res.status(401).json({ message })
    } else {
      next()
    }
  })
}
