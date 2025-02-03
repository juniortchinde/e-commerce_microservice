const User = require('../models/User.model');

module.exports.payOrder =  async (req,res,next)=>{

    try{

        // on recupere le user connecté
        const user = await User.findById(req.auth.userId);
        // si on ne trouve pas le user on renvoie un message pour lui lui qu'il n'est pas connecté
        if(!user){
            return res.status(401).send({error: true, message : "not logged in"});
        }

        // on récupere le montant de la commande et on vérifie si l'utilisateur à assez d'argent sur son compte pour passer la commande
        const amount = req.body.amount;
        if ( req.body.amount > user.money ) {
            return res.status(400).send({error: true, message : "not enough money in your account"});
        }

        // on soustrait le montant de la commande de son compte 
        const newMoney = user.money - amount;
        await User.updateOne(
            {_id: user._id},
            {money: newMoney},
        )
        req.pay = true
        next();
    }
    catch(err){
        console.log(err);
        return res.status(500).send({message : "internal server error"});
    }

}