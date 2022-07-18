const multer = require('multer')

//variable dictionnaire pour les mime_types d'images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

//configuration de multer
const storage = multer.diskStorage({
  //indique le chemin ou enregistrer les fichiers
  destination: (req, file, callback) => {
    callback(null, 'back/images')
  },
  //renome le fichier à enregistrer
  filename: (req, file, callback) => {
    //récupère le nom d'origine du fichier et remplace les espaces par des underscores
    const nameWithExtension = file.originalname.split(' ').join('_')
    //récupère uniquement le nom du fichier sans son extension (.jpg/.jpeg/.png)
    const name = nameWithExtension.split('.')[0]
    //récupère la bonne extension pour le fichier grâce à la variable MIME_TYPES déclarée plus haut
    const extension = MIME_TYPES[file.mimetype]
    //concatene le nom du fichier + un timestamp ( pour assurer l'unicité du nom du fichier ) + l'extension
    callback(null, name + Date.now() + '.' + extension)
  }
})

//exporte multer complètement configuré en lui indiquant qu'il gérera uniquement des images
module.exports = multer({ storage }).single('image')
