import "dotenv/config"
import express from "express";
import cors from 'cors';
const app = express();
import {createServer} from 'node:http'
const http= createServer(app);
import {SocketIO} from './config/socketio'
import { redisClient } from "./config/redis";

import { connectProducer, sendMessage } from "./kafka/producer";
// import { connectConsumer, subscribeToRoom,stopConsumer } from "./kafka/consumer";
import { ChatConsumer } from "./kafka/chat.consumer";
import { createTopics } from "./kafka/admin";
import router from "./routes/index";
 const io= new SocketIO(http).getIO();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS!.split(' ') }));
console.log(process.env.ALLOWED_ORIGINS!.split(' '))
app.use(router)


const chatConsumer=new ChatConsumer();
io.on("connection", (socket) => {
  if (socket.recovered) {
   console.log("Revoverd********************")
  } else {
    console.log("New connection")
  }
  socket.on("subscribe", async(topic) => {
    createTopics(topic)
    console.log("user subscribe socketio", topic)
    socket.join(topic)
    chatConsumer.subscribeToTopic(topic)
   // await connectConsumer();
    // await subscribeToRoom(topic);
    
  });

  socket.on("chatMessage",async (msgObj)=>{
    const {senderId,groupId, message}=msgObj
    await sendMessage(groupId, message)
  })
});

const PORT=process.env.PORT || 3000;
const httpServer=http.listen(PORT, async () => {
  await redisClient.connect()
  await startServices()
  //await stopConsumer()
  console.log(`Server is running on port ${PORT}`);
});

const startServices=async()=>{
  // await initializeSocket(http);
  await connectProducer(); 
  await chatConsumer.startConsumer();
  // await connectConsumer() 
}

// Listen for shutdown signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Cleanup function to be called on shutdown
async function cleanup() {
  console.log('Cleaning up and disconnecting from Redis...');
  
  await redisClient.disconnect();

  httpServer.close(() => {
    console.log('Server closed. Exiting process...');
    process.exit(0);
  });
}
