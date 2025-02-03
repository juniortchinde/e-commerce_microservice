const jwt = require('jsonwebtoken');
const UserToken = require('../models/UserToken.model.js')

const generateToken = async (user) => {
    try{
        const payload = { _id : user._id};
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN,
            { expiresIn : "10s"}
        );
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN,
            {expiresIn : "30d"}
        );

        const userToken = await UserToken.findOne({userId : user._id});
        if (userToken) await UserToken.deleteOne({userId : user._id});

        await new UserToken({
            userId : user._id, token: refreshToken
        }).save();
        return Promise.resolve(({ accessToken, refreshToken})); 
    }catch(err){
        return Promise.reject(err)
    }
}
module.exports = generateToken