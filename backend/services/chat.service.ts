import { ChatConsumer } from "./chat.consumer";
import { ChatProducer } from "./chat.producer";
import { createTopics } from "./admin";
import { SocketIO } from "../config/socketio";
import { Server } from "http";
import {RedisClient} from "../config/redis";
export const startChatServices = async (http:Server,redisClient:RedisClient) => {
    const io = new SocketIO(http, redisClient).getIO();
    const chatConsumer = new ChatConsumer(io);
    const chatProducer = new ChatProducer();
    await chatProducer.start();
    await chatConsumer.startConsumer();
  
    io.on("connection", (socket) => {
      const count = io.engine.clientsCount;
      console.log("Connected Users", count);
      if (socket.recovered) {
        console.log("Recoverd********************");
      } else {
        console.log("New connection");
      }
  
      socket.on("subscribe", async (topic) => {
        createTopics(topic);
        console.log("user subscribe socketio", topic);
        socket.join(topic);
        await chatConsumer.subscribeToTopic(topic);
      });
  
      socket.on("chatMessage", async (msgObj) => {
        const { senderId, room, message } = msgObj;
        // socket.emit('message', msgObj);
         await chatProducer.sendMessage({senderId: senderId,room,message})
      });
      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  };