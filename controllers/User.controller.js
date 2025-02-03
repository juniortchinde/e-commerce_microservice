const User = require("../models/User.model.js");
const bcrypt = require("bcryptjs");

const generateTokens = require("../utils/generateToken.js");
const {
    signUpBodyValidation,
    logInBodyValidation,
} = require("../utils/validationSchema.js");


module.exports.signup = async (req, res, next) => {
    try {
        const { error } = signUpBodyValidation(req.body);
        if (error) {
            return res
                .status(400)
                .json({ error: true, message: error.details[0].message });
        }
        const { firstname, lastname, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user){
            return res
                .status(400)
                .json({ error: true, message: "User with given email already exist" });
        }
        const salt = bcrypt.genSaltSync(Number(process.env.SALT));
        const hash = bcrypt.hashSync(password, salt);

        await new User({
            firstname,
            lastname,
            email,
            password: hash,
        }).save();
        res
            .status(201)
            .json({ error: false, message: "Account created sucessfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

module.exports.login = async(req, res, next) => {

    try{
        const {error} = logInBodyValidation(req.body);
        if(error){
            return res
                .status(400)
                .json({ error: true, message: error.details[0].message });
        }
        const { email, password } = req.body;
        const user = await User.findOne({email})
        
        if(!user){
            return res
                .status(401)
                .json({ error: true, message: "Invalid email or password" });
        }
        const verifiedPassword = bcrypt.compareSync(password, user.password);
        if(!verifiedPassword){
            return res
                .status(401)
                .json({ error: true, message: "Invalid email or password" });
        }
        const {accessToken, refreshToken} = await generateTokens(user)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,      // Non accessible via JavaScript
            secure: false,        // Seulement envoyé via HTTPS
            sameSite : "Lax",
            maxAge: 30 * 24 * 60 * 60 * 1000, // Expire après  jours

        });

        res.status(200).json({
            error: false,
            lastname: user.lastname,
            accessToken,
            message: "Logged in successfully",
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

module.exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId).select("-password");
        if (!user){
            return res.status(401).json({error: true, message: "not authenticated" });
        }

        return res.json({error: false, user});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}

const addMoney = async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.auth.userId },
            {money: req.body.money},
        )
        return res.status(200).json({error: false, message: "Successfully added money" });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}

module.exports.updateUser = async (req, res) => {
    try {
        await User.updateOne(
            {_id: req.auth.userId},
            {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone,
                address: req.body.address
            }
        )
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
}