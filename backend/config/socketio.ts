import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import {RedisClient} from "./redis";

export class SocketIO {
  private io: Server;
  constructor(server: HttpServer, redisClient: RedisClient) {
    console.log("SocketIO constructor")
    this.io = new Server(server, {
      adapter: createAdapter(redisClient.getRedisClient()),
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
  }

  getIO = () => {
    return this.io;
  };
}
