const Products = require("../models/Product.model");
const amqp = require('amqplib');

async function productDataServer() {
    try {
        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();

        const queue = 'product_rpc_queue';

        await channel.assertQueue(queue, { durable: false });
        await channel.prefetch(1);

        console.log(' [x] En attente de requêtes RPC sur', queue);

        channel.consume(queue, async (msg) => {
            try {
                const msgString = msg.content.toString();
                const orderProductList = JSON.parse(msgString);

                console.log(" [>] Requête reçue :", orderProductList);

                // Appel à la fonction métier
                const response = await productInfo(orderProductList);

                // Envoi de la réponse à la file temporaire du client
                channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(response)),
                    {
                        correlationId: msg.properties.correlationId
                    }
                );

                channel.ack(msg);
                console.log(" [<] Réponse envoyée avec correlationId :", msg.properties.correlationId);

            } catch (err) {
                console.error(" [!] Erreur lors du traitement de la requête :", err);
                channel.ack(msg); // Optionnel selon ta stratégie de retry
            }
        });

    } catch (err) {
        console.error(" [!] Erreur dans productDataServer :", err);
    }
}

const productInfo = async (orderProductList) =>{
    try {
        const productList = []
        let i = 0;
        // pour arreter la boucle en cas d'erreur
        let error = false
        // pour capturer le message d'erreur si une erreur se produit
        let errorMsg = "";

        while(i < orderProductList.length && !error ){
            // on récupere le product correspond à l'id courant
            // à condition que celui ci existe est un stock supérieur ou égal à la quantité commandée
            const product = await Products.findOne({
                _id: orderProductList[i]._id,
                quantity: { $gte: orderProductList[i].quantity}
            });

            //si oui
            if(product){
                // on met à jour le stock
                await Products.updateOne(
                    { _id: orderProductList[i]._id},
                    {quantity: product.quantity - orderProductList[i].quantity}
                )

                // et on récupère les infos du produit
                productList.push({
                    title: product.title,
                    quantity: orderProductList[i].quantity,
                    price: product.price,
                    category: product.category,
                    images: product.images,
                    userId: product.userId,
                });
            }
            // si non
            else {
                error = true;
                errorMsg = `Le product ${orderProductList[i].title} n'est plus disponible`;
            }
        }
        //S'il y'a eu une erreur on retourne le message d'erreur
        if (error){
            return errorMsg;
        }
        // sinon on retourne le tableau des produits
        else {
            return productList;
        }
    }
    catch(err){
        console.error(err);
    }
}

module.exports = {productDataServer};