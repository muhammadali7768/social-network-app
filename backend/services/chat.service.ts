import { ChatConsumer } from "./chat.consumer";
import { ChatProducer } from "./chat.producer";
import { createTopics } from "./admin";
import { SocketIO } from "../config/socketio";
import { Server } from "http";
import {RedisClient} from "../config/redis";
import { getMainRoomMessages } from "../controllers/message.controller";
import { validateToken } from "../middleware/auth.middleware";

export const startChatServices = async (http:Server,redisClient:RedisClient) => {
    const io = new SocketIO(http, redisClient).getIO();
    const chatConsumer = new ChatConsumer(io);
    const chatProducer = new ChatProducer();
    await chatProducer.start();
    await chatConsumer.startConsumer();
  
    io.use(async(socket, next) => {
      //TODO: Verify token and get user detail
        const token = socket.handshake.auth.token;
        console.log("socket token",socket.handshake)
        if (!token) {
          return next(new Error("invalid token"));
        }
        const decoded=await validateToken(token)
        if(decoded ===null) {
          return next(new Error("invalid token"));
        }
        socket.data.user=decoded
        console.log("Socket User",socket.data.user)
        next();
      });
    io.on("connection", async(socket) => {
      const count = io.engine.clientsCount;
      console.log("Connected Users", count);
      
      socket.on("subscribe", async (topic) => {
        createTopics(topic);
        socket.join(topic);
        await chatConsumer.subscribeToTopic(topic);
        const messages=await getMainRoomMessages();
        socket.emit("messageHistory",messages)
      });
  
      socket.on("chatMessage", async (msgObj) => {
        const { senderId, room, message } = msgObj;
         await chatProducer.sendMessage({senderId: senderId,room,message})
      });

      socket.onAny((event, ...args) => {
        console.log(event, args);
      });
      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  };