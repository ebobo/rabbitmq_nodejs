const amqp = require('amqplib');

// Get message from command line
const args = process.argv.slice(2);

if (args.length == 0) {
  console.log('Usage: receive_logs_direct.js [light] [middle] [heavy]');
  process.exit(1);
}

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    // Create exchange if it doesn't exist
    const exchange = 'task_exchange';
    await channel.assertExchange(exchange, 'topic', { durable: false });

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
        const input = JSON.parse(msg.content.toString());
        console.log(' [c] Received message %s', input);
        let needTime = 0;
        if (input.severity === 'heavy') {
          needTime = 8000;
        } else if (input.severity === 'middle') {
          needTime = 5000;
        } else if (input.severity === 'light') {
          needTime = 3000;
        }
        console.log(' [c] Need %d ms to process', needTime);

        setTimeout(() => {
          console.log(' [c] Done');
          // Acknowledge message as processed
          channel.ack(msg);

          // Send message to exchange
          channel.publish(
            exchange,
            'done',
            Buffer.from(`task ${input.severity} done`)
          );
        }, needTime);
      },
      { noAck: false }
    );
  } catch (error) {
    console.log(error);
  }
};

connect();
