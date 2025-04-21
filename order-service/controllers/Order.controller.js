const Order = require('../models/Order.model');
const messageBroker = require('../message_broker/rabbitmq');


module.exports.createOrder = async (req, res) => {
    try {
        const {orderProductList, address} = req.body.orderProductList;

        // On récupere les détails des produits via le message broker
        const productListInfo = await messageBroker.productDataClient(orderProductList);

        if(typeof productListInfo === 'string') {
            return res.status(400).send({message: productListInfo})
        }


        let amount = 0;
        for(let i = 0; i < productListInfo.length; i++){
            amount += productListInfo[i].price * productListInfo[i].quantity;
        }

        //

        if (i < productList.length) {
            return res.status(401).send({ error: true, message : "Not enough products" });
        }

        await Order.create({
            userId: req.auth.userId,
            productList: productList,
            destination: destination,
            amount: amount,
            state: "committed"
        })
        res.status(201).json({error: false, message: "Order committed and waiting of shipping." });
    }

    catch(err){
        console.log(err)
        return res.status(400).json({error: err.message})
    }
}

module.exports.getOrders = async (req, res) => {
    try {

        const orders = await Order.aggregate([
            {$match: {userId: req.auth.userId}},
            {sort: {createdAt: -1}},
            {$limit: 10}
        ])

        if(!orders || !orders.length > 0){
            return res.status(400).json({
                error: true,
                message : "No orders currently"
            })
        }

        return res.status(200).json({ error: false, orders});
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({error: true, message:"internal server error"})
    }
}