const amqp = require('amqplib');

const queue = 'jobs';

const msg = {
  number: process.argv[2],
};

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    // Create queue
    await channel.assertQueue(queue, { durable: false });
    // Send message to queue
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
    console.log(' [x] Sent %s', msg);
  } catch (error) {
    console.log(error);
  }
};

connect();
