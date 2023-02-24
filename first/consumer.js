const amqp = require('amqplib');

const queue = 'jobs';

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    // Create queue if it doesn't exist
    await channel.assertQueue(queue, { durable: false });
    // Consume messages
    channel.consume(queue, (msg) => {
      const input = JSON.parse(msg.content.toString());
      console.log(' [c] Received %s', input.number);
      if (input.number == 29) {
        console.log(' acking');
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

connect();
