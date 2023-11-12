import { kafka } from './client.js';
import { getIO } from '../config/socketio.js';

let consumer;
let subscribedRoom;

// Function to establish the connection to the Kafka cluster
async function connectConsumer() {
  consumer = kafka.consumer({ groupId: 'chat-consumer' });
  await consumer.connect();
  console.log('Consumer started');
}

// Function to subscribe to a specific chat room/topic
async function subscribeToRoom(room) {
  if (subscribedRoom === room) {
    console.log(`Already subscribed to room: ${room}`);
    // Send all the old messages
    await consumer.seek({ topic: room, partition: 0, offset: 7 });
    const io = getIO();
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // Emit each received message to the Socket.IO client
        io.emit('message', message.value.toString());
      },
    });

    return; // Return if already subscribed to the same room
  }

  if (consumer) {
    if (subscribedRoom) {
      await consumer.unsubscribe(subscribedRoom);
      console.log(`Unsubscribed from previous room: ${subscribedRoom}`);
    }
    await consumer.subscribe({ topic: room, fromBeginning: true });
    subscribedRoom = room;
    console.log(`Subscribed to room: ${room}`);
    const io = getIO();
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // Process incoming chat messages
        const chatMessage = JSON.parse(message.value);
        console.log('Message', chatMessage);
       // io.to(topic).emit('message', chatMessage);
       io.emit('message', chatMessage)
      },
    });
  }
}

// Function to stop the consumer
async function stopConsumer() {
  if (consumer) {
    await consumer.disconnect();
    console.log('Consumer stopped');
  }
}

export { connectConsumer, subscribeToRoom, stopConsumer };
