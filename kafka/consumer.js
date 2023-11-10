const {kafka}= require('./client') 

const consumer = kafka.consumer({ groupId: 'chat-consumer' });

// Calling this function will establish a connection to the kafka cluster
async function connectConsumer() {
  await consumer.connect();
}

// Calling this function will subscribe to specific chat room/ topic
async function subscribeToRoom(room) {
  await consumer.subscribe({ topic: room, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Process incoming chat messages
      const chatMessage = JSON.parse(message.value);
      io.to(topic).emit('message', chatMessage);
    },
  });
}

module.exports = { connectConsumer, subscribeToRoom };