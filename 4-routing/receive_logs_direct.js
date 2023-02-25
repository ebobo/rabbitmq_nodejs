const amqp = require('amqplib');

// Get message from command line
const args = process.argv.slice(2);

if (args.length == 0) {
  console.log('Usage: receive_logs_direct.js [info] [warning] [error]');
  process.exit(1);
}

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    // Create exchange if it doesn't exist
    const exchange = 'direct_logs';
    await channel.assertExchange(exchange, 'direct', { durable: false });

    // Create exclusive queue
    const q = await channel.assertQueue('', { exclusive: true });

    console.log(
      ' [*] Waiting for messages in %s. To exit press CTRL+C',
      q.queue
    );

    // Bind queue to exchange
    args.forEach((severity) => {
      console.log(' [x] Binding queue with routing key %s', severity);
      channel.bindQueue(q.queue, exchange, severity);
    });

    // Consume messages
    channel.consume(
      q.queue,
      (msg) => {
        console.log(' [c] Received message %s', msg.content.toString());
        setTimeout(() => {
          console.log(' [c] Done');
          // Acknowledge message as processed
          channel.ack(msg);
        }, 3000);
      },
      { noAck: false }
    );
  } catch (error) {
    console.log(error);
  }
};

connect();
