const { verify } = require('jsonwebtoken')
const privateKey = require('../utils/private_key')
const { errorName } = require('../utils/error-name')

module.exports = (req, res, next) => {
    try {

        //sauvegarde dans une variable le token de l'utilisateur.
        const authorizationHeader = req.headers.authorization

        //si le token n'est pas renseigné dans la req, retourne une erreur.
        if(!authorizationHeader){
            const error = new Error('Veuillez vous connecter puis réssayez.')
            error.name = errorName.auth
            error.statusCode = 401
            throw error
        }

        //sauvegarde uniquement la partie unique du token de l'utilisateur.
        const token = authorizationHeader.split(' ')[1]

        const decodedToken = verify(token, privateKey)

        const userId = decodedToken.userId

        req.auth = {
            userId: userId
        }

        //vérifie si l'id de l'utilisateur dans le corps de la requête correspond bien avec celui présent dans le token d'identification.
        if (req.body.userId && (req.body.userId !== userId)){
            const error = new Error('Requête invalide.')
            error.name = errorName.auth
            error.statusCode = 401
            throw error
        }

        next()

    } catch (error) {

        next(error)

    }
}
