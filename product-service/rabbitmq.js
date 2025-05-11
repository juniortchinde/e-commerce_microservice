const Products = require("./models/Product.model");
const amqp = require('amqplib');
const {productInfo, updateProductForOrder} = require("./utils/productInfoFetchData");

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



async function receiveOrderData() {
    try {
        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        const exchange = "order_validate_exchange";
        const routingKey = "order_validate_routing_key";

        await channel.assertExchange(exchange, "direct", {durable: false});

        const queue = await channel.assertQueue("",{
            exclusive: true
        })

        await channel.bindQueue(queue.queue, exchange, routingKey);

        console.log(' [*] Waiting for messages in %s', exchange);


        channel.consume(queue.queue, async (msg) => {
            const order = JSON.parse(msg.content.toString());
            try{
                console.log(" [x] Received:", order );
                await updateProductForOrder(order.productList)
            }
            catch (err) {
                console.error(" [!] Error processing message:", err);
                // todo roll back
            }
        }, {noAck: true});

    } catch (err) {
        console.error(err);
        throw err
    }
}

module.exports = {productDataServer,  receiveOrderData};