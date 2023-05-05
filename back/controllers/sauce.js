const sauceServices = require('../services/sauce')
const { validationResult } = require('express-validator')
const fileUtils = require('../utils/delete-file')
const { errorName } = require('../utils/error-name')


/**
 * retourne au front toutes les sauces présente dans la base de données.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {next} function Méthode permettant d'envoyer toutes les erreurs retournées à l'errorHandler.
 */
exports.getAllSauces = async (req, res, next) =>{
    try {

        const sauces = await sauceServices.getAll()

        return res.status(200).json(sauces)

    } catch (error) {

        next(error)

    }
}


/**
 * gestion des erreurs de validation des données de la requête.
 * retourne au front la sauce avec l'id passé en paramètre de l'url de la requête.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {next} function Méthode permettant d'envoyer toutes les erreurs retournées à l'errorHandler.
 */
exports.getOneSauce = async (req, res, next) =>{
    try {

        const validationErrors = validationResult(req)
        if(!validationErrors.isEmpty()){
            const message = validationErrors.array().map(validationError => validationError.msg).join(', ')
            const error = new Error(message)
            error.name = errorName.validation
            error.statusCode = 400
            throw error
        }

        const id = req.params.id

        const sauce = await sauceServices.getOne(id)

        return res.status(200).json(sauce)

    } catch (error) {

        next(error)

    }
}


/**
 * gestion des erreurs de validation des données de la requête.
 * crée l'objet sauce complet de la nouvelle sauce avec les données présentes dans le body de la requête.
 * Transmet l'objet sauce au service pour ajout en bdd.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {next} function Méthode permettant d'envoyer toutes les erreurs retournées à l'errorHandler.
 */
exports.createSauce = async (req, res, next) =>{
    try {
        
        const validationErrors = validationResult(req)
        if(!validationErrors.isEmpty()){
            const message = validationErrors.array().map(validationError => validationError.msg).join(', ')
            const error = new Error(message)
            error.name = errorName.validation
            error.statusCode = 400
            throw error
        }

        const sauce = {
            ...req.body,
            imageUrl: `${req.protocol}://${req.get('host')}/back/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: []
        }

        const message = await sauceServices.create(sauce)

        return res.status(200).json({message})
        
    } catch (error) {

        next(error)
        
    }
}


/**
 * gestion des erreurs de validation des données de la requête.
 * vérifie l'autorisation de l'utilisateur à modifier la sauce.
 * supprime l'ancienne image stockée dans le serveur si une nouvelle est ajoutée.
 * récupère les données de la sauce après modification dans le body de la requête et les transmets au service pour modification en bdd.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {next} function Méthode permettant d'envoyer toutes les erreurs retournées à l'errorHandler.
 */
exports.updateSauce = async (req, res, next) =>{
    try {
        
        const validationErrors = validationResult(req)
        if(!validationErrors.isEmpty()){
            const message = validationErrors.array().map(validationError => validationError.msg).join(', ')
            const error = new Error(message)
            error.name = errorName.validation
            error.statusCode = 400
            throw error
        }

        const sauceId = req.params.id

        const sauce = await sauceServices.getOne(sauceId)

        if(sauce.userId !== req.auth.userId){
            const error = new Error('Vous n`\'êtes pas autorisé à modifier cette sauce.')
            error.name = errorName.auth
            error.statusCode = 401
            throw error
        }

        let newSauce = {
            ...req.body
        }

        if(req.file){
            fileUtils.deleteFile(sauce.imageUrl)
            newSauce.imageUrl = `${req.protocol}://${req.get('host')}/back/images/${req.file.filename}`
        }

        const message = await sauceServices.update(sauceId, newSauce)

        return res.status(200).json({ message })

    } catch (error) {
        
        next(error)

    }

}


/**
 * gestion des erreurs de validation des données de la requête.
 * vérifie l'autorisation de l'utilisateur à supprimer la sauce.
 * supprime l'image de la sauce qui va être supprimée.
 * transmet l'id de la sauce à supprimer au service pour suppresion.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {next} function Méthode permettant d'envoyer toutes les erreurs retournées à l'errorHandler.
 */
exports.deleteSauce = async (req, res, next) =>{
    try {

        const validationErrors = validationResult(req)
        if(!validationErrors.isEmpty()){
            const message = validationErrors.array().map(validationError => validationError.msg).join(', ')
            const error = new Error(message)
            error.name = errorName.validation
            error.statusCode = 400
            throw error
        }

        const sauceId = req.params.id
        const userId = req.auth.userId

        const sauce = await sauceServices.getOne(sauceId)

        if(userId !== sauce.userId){
            const error = new Error('Vous n`\'êtes pas autorisé à supprimer cette sauce.')
            error.name = errorName.auth
            error.statusCode = 401
            throw error
        }
        
        fileUtils.deleteFile(sauce.imageUrl)

        const message = await sauceServices.delete(sauceId)

        return res.status(200).json( message )
        
    } catch (error) {

        next(error)

    }

}


/**
 * gestion des erreurs de validation des données de la requête.
 * vérifie si la requête est une requête pour like / dislike / unlike ou undislike et exécute la fonction du service correspondante.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 * @param {next} function Méthode permettant d'envoyer toutes les erreurs retournées à l'errorHandler.
 */
exports.likeSauce = async (req, res, next) =>{

    try {
        
        const validationErrors = validationResult(req)
        if(!validationErrors.isEmpty()){
            const message = validationErrors.array().map(validationError => validationError.msg).join(', ')
            const error = new Error(message)
            error.name = errorName.validation
            error.statusCode = 400
            throw error
        }

        const sauceId = req.params.id
        const userId = req.body.userId
        const like = req.body.like

        const sauce = await sauceServices.getOne(sauceId)

        let message

        if(+like === 1){

            message = await sauceServices.like(sauce, userId)

        }else if(+like === -1){

            message = await sauceServices.dislike(sauce, userId)

        }else{

            message = await sauceServices.unLike(sauce, userId)

        }

        return res.status(200).json(message)

    } catch (error) {
        
        throw error

    }

}
