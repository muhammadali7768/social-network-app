import { ChatConsumer } from "./chat-consumer.service";
import { ChatProducer } from "./chat-producer.service";
import { createTopics } from "./kafka-admin.service";
import { SocketIO } from "../config/socketio";
import { Server } from "http";
import { RedisClient } from "../config/redis";
import { getMainRoomMessages } from "../controllers/message.controller";
import { validateToken } from "../middleware/auth.middleware";
import cookie from "cookie";

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
  // On services start we have to subscribe to both chat and private_chat topics
  ["chat", "private_chat"].forEach(async (topic: string) => {
    await chatConsumer.subscribeToTopic(topic);
  });

  io.use(async (socket, next) => {
    const tokens = cookie.parse(socket.request.headers.cookie || "");
    console.log("Socket", tokens.token);
    // const token=socket.request.headers.cookie?.token
    if (!tokens?.token) {
      return next(new Error("invalid token"));
    }
    const decoded = await validateToken(tokens.token);
    console.log("socket decoded user", decoded);
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
      //Join the topic: chat | private_chat
      socket.join(topic);
      //Also join the logedin user socket
      socket.join(user.id.toString());
      await redisClient.saveUser(user, "online");
      const onlineUser = await redisClient.findOnlineUser(user.id);
      socket.to(topic).emit("userConnected", onlineUser);
      const onlineUsers = await redisClient.getOnlineUsers("online_users");
      socket.emit("users", onlineUsers);
      const messages = await getMainRoomMessages();
      console.log("messages", messages.length);
      socket.emit("messageHistory", messages);
    });

    socket.on("mainChatMessage", async (msgObj) => {
      const { senderId, room, message } = msgObj;
      console.log("message", message);
      await chatProducer.sendMainChatMessage({
        senderId: senderId,
        room,
        message,
      });
    });

    socket.on("privateChatMessage", async (msgObj) => {
      const { senderId, room, message, recipientId } = msgObj;
      console.log("message", message);
      await chatProducer.sendPrivateMessage({
        senderId: senderId,
        room,
        message,
        recipientId,
      });
    });

    socket.on("disconnect", async () => {
      socket.broadcast.emit("userDisconnected", user.id);
      await redisClient.saveUser(user, "offline");
      console.log("User disconnected");
    });
  });
};
