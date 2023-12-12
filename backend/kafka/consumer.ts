import { Consumer, EachMessagePayload } from 'kafkajs';
import { kafka } from '../config/kafka.client';
import { getIO } from '../config/socketio';

let consumer:Consumer;
let subscribedRoom:string;

// Function to establish the connection to the Kafka cluster
async function connectConsumer() {
  consumer = kafka.consumer({ groupId: 'chat-consumer', sessionTimeout: 15000 });
  await consumer.connect();
  console.log('Consumer started');
}

const getMessageHistory=async(topic:string)=>{
  await consumer.seek({ topic, partition: 0, offset: "7" });
  const io = getIO();
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Emit each received message to the Socket.IO client
      io.to(topic).emit('message', message.value?.toString());
    },
  });
}

// Function to subscribe to a specific chat room/topic
async function subscribeToRoom(room:string) {
  if (subscribedRoom === room) {
    console.log(`Already subscribed to room: ${room}`);
    getMessageHistory(room)
      return; // Return if already subscribed to the same room
  }

  if (consumer) {
   
    await consumer.subscribe({ topic: room, fromBeginning: true });
    subscribedRoom = room;
    console.log(`Subscribed to room: ${room}`);
    const io = getIO();
    await consumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic, partition, message }=messagePayload;
        // Process incoming chat messages
        // const chatMessage = JSON.parse(message.value);
        console.log('Message', message.value);
       // io.to(topic).emit('message', chatMessage);
       io.to(topic).emit('message', message.value)
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
