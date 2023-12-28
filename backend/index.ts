import "dotenv/config";
import express from "express";
import cors from "cors";
const app = express();
import { createServer } from "node:http";
const http = createServer(app);
import { SocketIO } from "./config/socketio";
import { RedisClient } from "./config/redis";

// import { connectProducer, sendMessage } from "./kafka/producer";
// import { connectConsumer, subscribeToRoom,stopConsumer } from "./kafka/consumer";
import { ChatConsumer } from "./services/chat.consumer";
import { ChatProducer } from "./services/chat.producer";
import { createTopics } from "./services/admin";
import router from "./routes/index";

app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS!.split(" ") }));
console.log(process.env.ALLOWED_ORIGINS!.split(" "));
app.use(router);

const PORT = process.env.PORT || 3000;
const redisClient = RedisClient.getInstance();
const httpServer = http.listen(PORT, async () => {
  await startServices();
  //await stopConsumer()
  console.log(`Server is running on port ${PORT}`);
});

const startServices = async () => {
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

// Listen for shutdown signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Cleanup function to be called on shutdown
async function cleanup() {
  console.log("Cleaning up and disconnecting from Redis...");

  await redisClient.disconnect();

  httpServer.close(() => {
    console.log("Server closed. Exiting process...");
    process.exit(0);
  });
}
