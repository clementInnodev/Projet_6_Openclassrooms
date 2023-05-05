const userServices = require('../services/user')
const { validationResult } = require('express-validator')
const { errorName } = require('../utils/error-name')

/**
 * gestion des erreurs de validation des données de la requête.
 * transmet les données du nouvel utilisateur au service pour ajout en bdd.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {next} function Méthode permettant d'envoyer toutes les erreurs retournées à l'errorHandler.
 */
exports.signup = async (req, res, next) => {
    try {

        const validationErrors = validationResult(req)
        if(!validationErrors.isEmpty()){
            const message = validationErrors.array().map(validationError => validationError.msg).join(', ')
            const error = new Error(message)
            error.name = errorName.validation
            error.statusCode = 400
            throw error
        }

        const email = req.body.email
        const password = req.body.password
        
        const message = await userServices.addUser(email, password)

        return res.status(200).json({message})

    } catch (error) {

        next(error)

    }
}


/**
 * gestion des erreurs de validation des données de la requête.
 * transmet au service les données de l'utilisateur pour valider la connexion.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {next} function Méthode permettant d'envoyer toutes les erreurs retournées à l'errorHandler.
 */
exports.login = async (req, res, next) => {
    try {

        const validationErrors = validationResult(req)
        if(!validationErrors.isEmpty()){
            const message = validationErrors.array().map(validationError => validationError.msg).join(', ')
            const error = new Error(message)
            error.name = errorName.validation
            error.statusCode = 400
            throw error
        }

        const email = req.body.email
        const password = req.body.password
        
        const data = await userServices.logon(email, password)

        return res.status(200).json(data)

    } catch (error) {

        next(error)
        
    }
}
