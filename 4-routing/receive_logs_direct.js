const amqp = require('amqplib');

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    const exchange = 'logs';
    // Create exchange if it doesn't exist
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    // Create exclusive queue
    const q = await channel.assertQueue('', { exclusive: true });

    console.log(
      ' [*] Waiting for messages in %s. To exit press CTRL+C',
      q.queue
    );

    // Bind queue to exchange
    channel.bindQueue(q.queue, exchange, '');

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
