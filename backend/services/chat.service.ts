import { ChatConsumer } from "./chat.consumer";
import { ChatProducer } from "./chat.producer";
import { createTopics } from "./admin";
import { SocketIO } from "../config/socketio";
import { Server } from "http";
import { RedisClient } from "../config/redis";
import { getMainRoomMessages } from "../controllers/message.controller";
import { validateToken } from "../middleware/auth.middleware";

export const startChatServices = async (
  http: Server,
  redisClient: RedisClient
) => {
  const io = new SocketIO(http, redisClient).getIO();
  const chatConsumer = new ChatConsumer(io);
  const chatProducer = new ChatProducer();
  await chatProducer.start();
  await chatConsumer.startConsumer();
  await createTopics();

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("invalid token"));
    }
    const decoded = await validateToken(token);
    if (decoded === null) {
      return next(new Error("invalid token"));
    }
    socket.data.user = decoded;
    next();
  });
  io.on("connection", async (socket) => {
    const count = io.engine.clientsCount;
    console.log("Connected Users", count);
    const user = socket.data.user;

  
    socket.on("subscribe", async (topic) => {
      console.log("Subscribe Event");
      socket.join(topic);
      await redisClient.saveUser(user, "online");
      const onlineUser = await redisClient.findOnlineUser(user.id);
      socket.to(topic).emit("userConnected", onlineUser);

      const onlineUsers = await redisClient.getOnlineUsers("online_users");
      socket.emit("users",onlineUsers)

      await chatConsumer.subscribeToTopic(topic);
      const messages = await getMainRoomMessages();
      socket.emit("messageHistory", messages);
    });

    socket.on("chatMessage", async (msgObj) => {
      const { senderId, room, message } = msgObj;
      await chatProducer.sendMessage({ senderId: senderId, room, message });
    });

    socket.on("disconnect", async () => {
      socket.broadcast.emit("userDisconnected", user.id);
      await redisClient.saveUser(user, "offline");
      console.log("User disconnected");
    });
  });
};
