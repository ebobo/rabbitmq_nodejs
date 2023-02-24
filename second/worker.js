const amqp = require('amqplib');

const queue = 'task_queue';

const connect = async () => {
  try {
    // Create connection to RabbitMQ
    const connection = await amqp.connect('amqp://localhost:5672');
    // Create channel
    const channel = await connection.createChannel();
    // Create queue if it doesn't exist
    await channel.assertQueue(queue, { durable: true });
    // Consume messages
    channel.consume(
      queue,
      (msg) => {
        const input = JSON.parse(msg.content.toString());
        console.log(' [c] Received task %s', input.id);
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
