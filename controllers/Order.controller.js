const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Product = require('../models/Product.model');


module.exports.createOrder = async (req, res) => {
    try {

        if(!req.pay){
            return res.status(401).send({ error: true, message : "not pay order"});
        }
        const {productList, destination} = req.body;

        const productListFromDB = await Product.find({_id: productList});


        let i = 0;
        let amount = 0;

        // tant que la quantité de produit commandé est inférieur  à la quantité du produit en stock

        while (productListFromDB[i].quantity > productList[i].quantity && i < productList.length){
            // calcul du montant de la commande;
            amount += productListFromDB[i].price * productList[i].quantity;
            i++;
        }
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