const Order = require("../models/Order.model");
const messageBroker = require("../rabbitmq");

async function updateOrderState(paymentResponseData){
    try {
        const {success, orderId} = paymentResponseData;
        console.log(paymentResponseData)

        if(!success){
          //echec de paiement
           await Order.findByIdAndUpdate(orderId, {state: "payment_failed"});
           return {
               success: false,
               message: "Paiement échoué"
           }
        }
        else{
            const order = await Order.findByIdAndUpdate(orderId, {state: "paid"}).select("_id userId productList");
            return {
                success: true,
                order: order,
            }
        }

    }
    catch (err) {
        console.log(err.message)
        return {
            success: false,
            message: err.message
        }
    }

}

module.exports = {updateOrderState}