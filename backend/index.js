import "dotenv/config.js"
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
app.use(cors({ origin: process.env.ALLOWED_ORIGINS.split(' ') }));
console.log(process.env.ALLOWED_ORIGINS.split(' '))
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
app.post("/api/users",(req, res)=>{
  console.log("request is hitting the api point",req.body)
  return res.send({message: "working"})
})

io.on("connection", (socket) => {

  socket.on("subscribe", async(topic) => {
    console.log("user subscribe socketio", topic)
    socket.join(topic)
   // await connectConsumer();
    await subscribeToRoom(topic);
    
  });

  socket.on("chatMessage",async (msgObj)=>{
    const {senderId,groupId, message}=msgObj
    await sendMessage(groupId, message)
  })
});

const PORT=process.env.PORT || 3000;
http.listen(PORT, async () => {

  //await stopConsumer()
  
 

  console.log(`Server is running on port ${PORT}`);
});
