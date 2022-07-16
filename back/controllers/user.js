const sauceServices = require('../services/user')


/**
 * Vérifie le contenu de la requête pour l'inscription d'un utilisateur.
 * Si la requête correspond à ce qui est attendu, appel la fonction addUser().
 * Sinon retourne un status 400 et un message d'erreur approprié.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.signup = (req, res) => {
  //si la requête ne contient pas un email valide ou un mot de passe valide
  if((!req.body.email || req.body.email === '') || (!req.body.password || req.body.password === '')){
    //retourne une erreur
    const message = `La requête est incomplète`
    return res.status(400).json({ message })
  }

  //appel de la fonction addUser()
  sauceServices.addUser(req, res)
}


/**
 * Vérifie le contenu de la requête pour la connexion d'un utilisateur.
 * Si la requête correspond à ce qui est attendu, appel la fonction logon().
 * Sinon retourne un status 400 et un message d'erreur approprié.
 *
 * @param {req} req La requête reçue du front.
 * @param {res} res La réponse renvoyée au front.
 */
exports.login = (req, res) => {
  //si la requête ne contient pas un email valide ou un mot de passe valide
  if((!req.body.email || req.body.email === '') || (!req.body.password || req.body.password === '')){
    //retourne une erreur
    const message = `La requête est incomplète`
    return res.status(400).json({ message })
  }

  //appel de la fonction logon()
  sauceServices.logon(req, res)
}
