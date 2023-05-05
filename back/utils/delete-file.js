const fs = require('fs')
const { errorName } = require('./error-name')
const path = require('path')

exports.deleteFile = (imageUrl) => {
    const filename = imageUrl.split('/back/')[1]
    const fullPath = path.join(path.resolve(__dirname, '..'), filename)
    fs.unlink(fullPath, (err) => {
        if(err){
            err.statusCode = 500
            err.name= errorName.server
            throw err
        }
    })
}