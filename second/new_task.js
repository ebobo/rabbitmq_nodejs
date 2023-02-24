const amqp = require('amqplib');

const queue = 'task_queue';

const msg = {
  type: 'task',
  id: process.argv[2],
};

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    // Create queue if it doesn't exist and make it durable, durable queues survive a broker restart
    await channel.assertQueue(queue, { durable: true });
    // Send message to queue and make it persistent, persistent messages survive a broker restart
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), {
      persistent: true,
    });
    console.log(' [x] Sent %s', msg);
  } catch (error) {
    console.log(error);
  }
};

connect();
