const Order = require('../models/Order.model');
const messageBroker = require('../rabbitmq');


module.exports.createOrder = async (req, res) => {
    try {
        const {orderProductList} = req.body;
        const userId = req.headers['x-user-id'];

        // On récupere les détails des produits via le message broker

        const productListInfo = await messageBroker.productDataClient(orderProductList);

        if (typeof productListInfo === 'string') {
            return res.status(400).send({message: productListInfo})
        }

        let amount = 0;
        for (let i = 0; i < productListInfo.length; i++) {
            amount += productListInfo[i].price * productListInfo[i].quantity;
        }
        console.log(productListInfo)

        const newOrder = new Order({
            userId,
            productList: productListInfo,
            amount: amount,
            state: "waiting_payment"
        })

        await newOrder.save()

        res.status(201).json({
            success: true,
            message: "votre commande à été passée avec succéss vous pouvez consulter son état d'avancement"
        });

        await messageBroker.emitPaymentData({
            userId,
            amount,
            orderId: newOrder._id,
        })
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
        res.status(200).json({ error: false, orders});

    }
    catch (error) {
        console.error(error);
        return res.status(500).send({error: true, message:"internal server error"})
    }
}
