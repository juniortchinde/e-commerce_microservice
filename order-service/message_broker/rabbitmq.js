const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

async function productDataClient(orderProductList) {
    const queue = "product_rpc_queue";
    const correlationId = uuidv4();
    const timeoutDuration = 5000; // Timeout de sécurité en ms

    try {

        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();

        const { queue: replyQueue } = await channel.assertQueue('', { exclusive: true });

        return await new Promise((resolve, reject) => {
            // si pas de réponse dans lae temps impartie on ferme la connexion
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


module.exports = {productDataClient};
