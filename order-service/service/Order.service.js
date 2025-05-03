const Order = require("../models/Order.model");
const messageBroker = require("../rabbitmq");

async function updateOrderState(paymentResponseData){
    try {
        const {success, orderId} = paymentResponseData;
        console.log(paymentResponseData)

        if(!success){
          // todo roll back
           await Order.findByIdAndUpdate(orderId, {state: "payment_failed"});
        }
        else{
            const order = await Order.findByIdAndUpdate(orderId, {state: "paid"}).select("_id userId productList");
            console.log(order)
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