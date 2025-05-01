const amqp = require('amqplib');
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

async function emitPayemenData(paymentData) {
    try{
        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        // création de l'echange
        const exchange = "payment_exchange";
        // key de routage vers le service de payment
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
module.exports = {productDataClient, emitPayemenData};
