const mongoose = require('mongoose')

const dbName = 'Clement'
const mdp = 'projet6'

exports.mongooseInit = (server, port, errorHandler) => {
    mongoose.connect(`mongodb+srv://${dbName}:${mdp}@cluster0.3t6fs19.mongodb.net/?retryWrites=true&w=majority`, {})
    .then( _ => {
        console.log('Connexion à MongoDB réussie !')

        const serv = server.listen(port)

        serv.on('error', errorHandler);
        serv.on('listening', () => {
            const address = serv.address();
            const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
            console.log('Listening on ' + bind);
        });

    })
    .catch(error => console.log('Connexion à MongoDB échouée !', error))
}
