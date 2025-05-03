const amqp = require('amqplib');
const orderService = require("./service/Order.service");
const { v4: uuidv4 } = require('uuid');

async function productDataClient(orderProductList) {
    const queue = "product_rpc_queue";
    const correlationId = uuidv4();
    const timeoutDuration = 5000; // Timeout de sécurité en ms
    console.log(orderProductList)
    try {

        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();

        const { queue: replyQueue } = await channel.assertQueue('', { exclusive: true });

        return await new Promise((resolve, reject) => {
            // si pas de réponse dans le temps impartie on ferme la connexion
            const timeout = setTimeout(() => {
                channel.close(); // fermeture du canl
                connection.close(); // fermeture de la connexion
                reject(new Error("Timeout: pas de réponse du service produit."));
            }, timeoutDuration);

            channel.consume(replyQueue, (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    clearTimeout(timeout);// si recoit la réponse on réinitialise le timeout
                    const productListData = JSON.parse(msg.content.toString());
                    console.log(`[Order Service] Réponse reçue pour correlationId: ${correlationId}`);
                    resolve(productListData);

                    channel.close();
                    connection.close();
                }
            }, {
                noAck: true
            });

            // Envoi de la requête avec une payload bien formatée
            channel.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(orderProductList)),
                {
                    correlationId,
                    replyTo: replyQueue
                }
            );

            console.log(`[Order Service] Requête envoyée, correlationId: ${correlationId}`);
        });

    } catch (error) {
        console.error(`[Order Service] Erreur lors de la récupération des données produits: ${error.message}`);
        throw error;
    }
}

async function emitPaymentData(paymentData) {
    try{
        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();

        const exchange = "payment_exchange";
        const routingKey = "payment_routing_key";

        await channel.assertExchange(exchange, 'direct', {
            durable: false
        });
        // envoie du message vers le service
        await channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(paymentData)));

        console.log("[x] Message envoyé vers payment_exchange");
         // fermer lea comnexion après l'envoie du message
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);

    }
    catch(err){
        console.log(err)
        throw err;
    }
}



// recevoir les informations de reponse du service de payment
async function receivePaymentResponseData() {
    try {
        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        const exchange = "payment_response_exchange";

        await channel.assertExchange(exchange, "direct", {durable: false});

        const queue = await channel.assertQueue("",{
            exclusive: true
        })
        const routingKey = "payment_response_routing_key";

        await channel.bindQueue(queue.queue, exchange, routingKey);

        console.log(' [*] Waiting for messages in %s', exchange);


        channel.consume(queue.queue, async (msg) => {
            console.log(" [x] Received %s", msg.content.toString());
            try{
                const paymentResponseData = JSON.parse(msg.content.toString());
                console.log(" [x] Received:", paymentResponseData);
                await orderService.updateOrderState(paymentResponseData);
            }
            catch (err) {
                console.error(" [!] Error processing message:", err);
                // Optionally reject and requeue message:
                channel.nack(msg, false, false); // or true to requeue
            }
        }, {noAck: true});

    } catch (err) {
        console.error(err);
        throw err
    }
}


module.exports = {productDataClient, emitPaymentData, receivePaymentResponseData};
