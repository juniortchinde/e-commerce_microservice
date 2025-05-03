const UserBalance = require("../models/UserBalance.model");

module.exports.payment = async (paymentData) => {
    try{
        // on recupère les info sur le message broker
        const {userId, amount, orderId} = paymentData;
        try{
            // recupére le solde du client qui initie la commande
            const userBalance = await UserBalance.findOne({userId});

            // on vérifie qu'il a un solde suffisant pour payer
            const newBalance = userBalance.balance - amount;
            if(newBalance < 0){
                // sinon un renvoi une érreur
                return {
                    success: false,
                    message: "Insufficient balance"
                }
            }

            // si oui on met à jour son solde et on marque le payement réussit
            await UserBalance.updateOne({userId}, {balance: newBalance});
            return {
                success: true,
                orderId,
                message: "Payment successful"
            }

        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                orderId,
                message: "An error occured while paying"
            }
        }
    }
    catch (err){
        console.log(err);
        return {
            success: false,
            message: "An error occured"
        }
    }

}


