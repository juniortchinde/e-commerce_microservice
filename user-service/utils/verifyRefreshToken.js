const UserToken = require('../models/UserToken.model');
const jwt = require("jsonwebtoken");

const verifyRefreshToken = async (refreshToken) => {
    try {
        // Chercher le refresh token dans la base de données
        const userToken = await UserToken.findOne({ token: refreshToken });

        // Si le token n'existe pas dans la base de données
        if (!userToken) {
            throw { error: true, message: "Invalid refresh token" };
        }

        // Vérifier si le refresh token est valide en utilisant jwt.verify()
        const tokenDetails = await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
                if (err) {
                    return reject({ error: true, message: "Invalid refresh token" });
                }
                resolve(decoded);
            });
        });

        // Si tout est valide, retourner les détails du token
        return {
            tokenDetails,
            error: false,
            message: "Valid refresh token",
        };
    } catch (err) {
        // Gérer les erreurs de manière unifiée
        throw err.error ? err : { error: true, message: "Internal Server Error" };
    }
};

module.exports = verifyRefreshToken;
