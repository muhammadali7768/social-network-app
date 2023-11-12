import express from "express";
import cors from 'cors';
const app = express();
import {createServer} from 'node:http'
const http= createServer(app);
import {initializeSocket,getIO} from './config/socketio.js'
await initializeSocket(http);

import { connectProducer, sendMessage } from "./kafka/producer.js";
import { connectConsumer, subscribeToRoom,stopConsumer } from "./kafka/consumer.js";
import { createTopics } from "./kafka/admin.js";
 const io= getIO();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001' }));

await connectProducer(); 
await connectConsumer()
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

  //await stopConsumer()
  
 

  console.log("Server is running on port 3000");
});
