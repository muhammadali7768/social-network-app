const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { connectProducer, sendMessage } = require('./kafka/producer');
const { connectConsumer, subscribeToRoom } = require('./kafka/consumer');


// Express route for sending chat messages to Kafka
app.post('/send/:room', async (req, res) => {
  const { room } = req.params;
  const { message } = req.body;

  try {
    await sendMessage(room, message);
    res.status(200).send('Message sent to Kafka');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Express route for handling WebSocket connections
io.on('connection', (socket) => {
  // Implement chat room logic and subscribe to Kafka topics when a new user joins

  socket.on('subscribe', (room) => {
    subscribeToRoom(room);
  });

  // Handle real-time messages received from Kafka and send them to the connected clients
  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const chatMessage = JSON.parse(message.value);
      io.to(topic).emit('message', chatMessage);
    },
  });
});

// Start your Express server and WebSocket connections
http.listen(3000, async() => {
    await connectProducer();  // Connect the Kafka producer
    await connectConsumer();  // Connect the Kafka consumer
  
  console.log('Server is running on port 3000');
});
