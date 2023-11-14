import { kafka } from './client.js';
import { getIO } from '../config/socketio.js';

let consumer;
let subscribedRoom;

// Function to establish the connection to the Kafka cluster
async function connectConsumer() {
  consumer = kafka.consumer({ groupId: 'chat-consumer', sessionTimeout: 15000 });
  await consumer.connect();
  console.log('Consumer started');
}

const getMessageHistory=async(topic)=>{
  await consumer.seek({ topic, partition: 0, offset: 7 });
  const io = getIO();
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Emit each received message to the Socket.IO client
      io.to(topic).emit('message', message.value.toString());
    },
  });
}

// Function to subscribe to a specific chat room/topic
async function subscribeToRoom(room) {
  if (subscribedRoom === room) {
    console.log(`Already subscribed to room: ${room}`);
    getMessageHistory(room)
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
       io.to(topic).emit('message', chatMessage)
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