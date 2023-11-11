const express = require("express");
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
 const {initializeSocket} =require('./config/socketio')

 const io = initializeSocket(http);
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001' }));

const { connectProducer, sendMessage } = require("./kafka/producer");
const { connectConsumer, subscribeToRoom,stopConsumer } = require("./kafka/consumer");
const { createTopics } = require("./kafka/admin");
// Route for sending chat messages to Kafka
app.post("/send/:room", async (req, res) => {
  const { room } = req.params;
  const { message } = req.body;
  createTopics(room);
  try {
    await sendMessage(room, message);
    res.status(200).send("Message sent to Kafka");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

io.on("connection", (socket) => {
  console.log("io connection started")
  socket.on("subscribe", async(room) => {
    console.log("on subscribe", room)
   // await connectConsumer();
    await subscribeToRoom(room);
    
  });

  socket.on("chatMessage",async (msgObj)=>{
    await sendMessage(msgObj.room, msgObj.message.text)
  })
});

http.listen(3000, async () => {
  await connectProducer(); 
  await connectConsumer()
  //await stopConsumer()
  
 

  console.log("Server is running on port 3000");
});
