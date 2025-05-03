const amqp = require('amqplib');
const paymentService = require('./services/Payment.service');


async function receivePaymentData() {
    try {
        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        const exchange = "payment_exchange";

        await channel.assertExchange(exchange, "direct", {durable: false});

        const queue = await channel.assertQueue("",{
            exclusive: true
        })
        const routingKey = "payment_routing_key";

        await channel.bindQueue(queue.queue, exchange, routingKey);

        console.log(' [*] Waiting for messages in %s', exchange);


        channel.consume(queue.queue, async (msg) => {
            console.log(" [x] Received %s", msg.content.toString());
            try{
                const paymentData = JSON.parse(msg.content.toString());
                console.log(" [x] Received:", paymentData);
                const paymentResponse = await paymentService.payment(paymentData);
                await emitPaymentValidationData(paymentResponse);
                console.log(" [✓] Payment processed:", paymentResponse);
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

async function emitPaymentValidationData(paymentResponseData){
    try {
        const connection = await amqp.connect(process.env.MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();

        const exchange = "payment_response_exchange";
        const routingKey = "payment_response_routing_key";

        await channel.assertExchange(exchange, "direct", {durable: false});

        await channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(paymentResponseData)))
    }
    catch (err) {
        console.error(err);
        throw err
    }
}

module.exports = {receivePaymentData};