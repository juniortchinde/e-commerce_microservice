const amqp = require('amqplib');
const paymentService = require('./services/Payment.service');

let paymentResponse = {}
let paymentError = {}

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

        let paymentData = {}

        channel.consume(queue.queue, async (msg) => {
            console.log(" [x] Received %s", msg.content.toString());
            try{
                paymentData = JSON.parse(msg.content.toString());
                console.log(" [x] Received:", paymentData);
                paymentResponse = await paymentService.payment(paymentData);
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

module.exports = {receivePaymentData};