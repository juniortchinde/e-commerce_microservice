const jwt = require('jsonwebtoken')
module.exports.protect = (req, res, next) =>{
    try{
        // on vérifie que le token reçu est bien un Bearer token sinon on renvoie un message d'erreur
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            console.log('raté')
            return res.status(401).json({
                error: true,
                message: "Authorization header missing or malformed",
            });
        }

        // puis on splip autour de l'espace et on recupère la partie correspondante au jwt token
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
        //on decode le token
        const decodedToken =  jwt.verify(token, process.env.JWT_SECRET);
        console.log(decodedToken);
        const userId = decodedToken._id;
        console.log(userId);

        // Ajouter userId dans les en-têtes pour transmission au microservice
        req.headers['x-user-id'] = userId;
        // on passe à la suite
        next()
    }
    catch(err){
        res.status(401).json({
            err : true, 
            message: "Not authorized, invalid token" })
    }
}