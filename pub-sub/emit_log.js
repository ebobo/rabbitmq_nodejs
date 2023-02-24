const amqp = require('amqplib');

const msg = process.argv.slice(2).join(' ') || 'Hello World!';

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    const exchange = 'logs';
    // Create exchange if it doesn't exist
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    // Send message to exchange
    channel.publish(exchange, '', Buffer.from(msg));
    console.log(' [x] Sent %s', msg);
  } catch (error) {
    console.log(error);
  }
};

connect();
