import "dotenv/config";
import express from "express";
import 'express-async-errors'
import cors from "cors";
const app = express();
import { createServer } from "node:http";
const http = createServer(app);
import { startChatServices } from "./services/chat.service";
import { RedisClient } from "./config/redis";
import { errorHandler } from "./middleware/error-handler.middleware";
import { NotFoundError } from "./errors/not-found.error";
import router from "./routes/index";
import cookieParser from 'cookie-parser'

app.use(express.json());
app.use(cors({credentials: true, origin: process.env.ALLOWED_ORIGINS!.split(" ") }));
app.use(cookieParser())
// app.use(cookieSession({
//    signed: false,
//    httpOnly:true,
//    secure: process.env.NODE_ENV==='production'
// }))

app.use(router);
app.all("*", () => {
  throw new NotFoundError("Route not found");
});
app.use(errorHandler);


const PORT = process.env.PORT || 3000;
const redisClient = RedisClient.getInstance();
const httpServer = http.listen(PORT, async () => {
  await startChatServices(http, redisClient);
  //await stopConsumer()
  console.log(`Server is running on port ${PORT}`);
});

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
