const amqp = require('amqplib');

const msg = {
  type: 'task',
  severity:
    process.argv.slice(2).length > 0 ? process.argv.slice(2)[0] : 'light',
  createdAt: new Date(),
};

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    // Create exchange if it doesn't exist
    const exchange = 'task_exchange';
    await channel.assertExchange(exchange, 'topic', { durable: false });

    // Send message to exchange
    channel.publish(exchange, msg.severity, Buffer.from(JSON.stringify(msg)));
    // send log message
    console.log(' [x] routing key %s ', msg.severity);
    console.log(" [x] Sent %s: '%s'", msg.severity, msg);

    // Create exclusive queue for finish tasks called 'done'
    const q = await channel.assertQueue('', { exclusive: true });

    channel.bindQueue(q.queue, exchange, 'done');

    channel.consume(
      q.queue,
      (msg) => {
        console.log(' [x] Received %s', msg.content.toString());
        channel.ack(msg);
      },
      { noAck: false }
    );

    // Close connection after 500ms
    // setTimeout(() => {
    //   connection.close();
    //   process.exit(0);
    // }, 8000);
  } catch (error) {
    console.log(error);
  }
};

connect();
