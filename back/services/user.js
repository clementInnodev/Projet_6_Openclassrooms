const { hash, compare } = require('bcrypt');
const { sign } = require('jsonwebtoken')
const privateKey = require('../utils/private_key')
const { errorName } = require('../utils/error-name')

const User = require('../models/User');


/**
 * Ajoute un utilisateur à la base de donnée (inscription).
 *
 * @param {email} string L'email de l'utilisateur.
 * @param {password} string Le mot de passe de l'utilisateur.
 */
exports.addUser = async (email, password) => {

    const hashedPassword = await hash(password, 12)

    const user = await User.create({
        email,
        password: hashedPassword
    })
    
    const message = `Le compte a été créé avec succès.`

    return message
}



/**
 * Connecte un utilisateur.
 *
 * @param {email} string L'email de l'utilisateur.
 * @param {password} string Le mot de passe de l'utilisateur.
 */
exports.logon = async (email, password) => {

    const user = await User.findOne({
        email
    })

    if(!user){
        const error = new Error('Utilisateur introuvable.')
        error.statusCode = 404
        error.name = errorName.notFound
        throw error
    }

    const valid = await compare(password, user.password)
    
    if(!valid){
        const error = new Error('Paire utilisateur/mot de passe incorrecte.')
        error.statusCode = 401
        error.name = errorName.auth
        throw error
    }

    const token = sign(
        { userId: user._id },
        privateKey,
        { expiresIn: '24h' }
    )

    const data = { 
        userId: user._id, token
    }

    return data
}
