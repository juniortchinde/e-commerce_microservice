const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
module.exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limite de 5 tentatives par IP pendant cette période
    message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.",
    headers: true, // Inclut les headers de rate limit
});

module.exports.protect = (req, res, next) =>{
    try{
        // on vérifie que le token reçu est bien un Bearer token sinon on renvoie un message d'erreur
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                error: true,
                message: "Authorization header missing or malformed",
            });
        }
        // puis on splip autour de l'espace et on recupère la partie correspondante au jwt token
        const token = req.headers.authorization.split(' ')[1];
        //on decode le token
        const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN);

        const userId = decodedToken._id;

        // Et on ajoute le userId decodé aux champs de la requête
        req.auth = {
            userId : userId
        };
        // on passe à la suite
        next()
    }
    catch(err){
        res.status(401).json({
            err : true, 
            message: "Not authorized, invalid token" })
    }
}