const multer = require('multer')

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'back/images')
  },
  filename: (req, file, callback) => {
    const nameWithExtension = file.originalname.split(' ').join('_')
    const name = nameWithExtension.split('.')[0]
    const extension = MIME_TYPES[file.mimetype]
    callback(null, name + Date.now() + '.' + extension)
  }
})

module.exports = multer({ storage }).single('image')
