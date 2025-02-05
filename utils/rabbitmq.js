const amqp = require('amqplib');

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    console.log('✅ Connexion à RabbitMQ réussie');
    return { connection, channel };
  } catch (error) {
    console.error('❌ Échec de la connexion à RabbitMQ', error);
    process.exit(1);
  }
}

module.exports = connectRabbitMQ;
