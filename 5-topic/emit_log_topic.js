const amqp = require('amqplib');

// Get message from command line
const args = process.argv.slice(2);
// If no message is provided, use default
const msg = process.argv.slice(2).join(' ') || 'Hello Qi!';
// If no severity is provided, use default
const severity = args.length > 0 ? args[0] : 'info';

const connect = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create connection to RabbitMQ
    // Create channel
    const channel = await connection.createChannel();
    // Create exchange if it doesn't exist
    const exchange = 'direct_logs';
    await channel.assertExchange(exchange, 'topic', { durable: false });
    // Send message to exchange
    channel.publish(exchange, severity, Buffer.from(msg));
    // Log message
    console.log(' [x] routing key %s ', severity);
    console.log(" [x] Sent %s: '%s'", severity, msg);

    // Close connection after 500ms
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log(error);
  }
};

connect();
