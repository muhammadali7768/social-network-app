import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { RedisClient } from "./redis";
import { IUser } from "../interfaces/user.interface";

interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void;
}
interface IAuthUser {
  user: IUser
}


export class SocketIO {
  private static io: Server<DefaultEventsMap,DefaultEventsMap,DefaultEventsMap, IAuthUser>;
  // constructor(server: HttpServer, redisClient: RedisClient) {
  //   console.log("SocketIO constructor");
  //   this.io = new Server<DefaultEventsMap,DefaultEventsMap,DefaultEventsMap, IAuthUser>(server, {
  //     adapter: createAdapter(redisClient.getRedisClient()),
  //     connectionStateRecovery: {},
  //     cors: {
  //       origin: "http://localhost:3000",
  //       methods: ["GET", "POST"],
  //       credentials: true,
  //     },
  //   });
  // }
 static async initialize (server: HttpServer, redisClient: RedisClient) {
  console.log("SocketIO constructor");
  this.io = new Server<DefaultEventsMap,DefaultEventsMap,DefaultEventsMap, IAuthUser>(server, {
    adapter: createAdapter(redisClient.getRedisClient()),
    connectionStateRecovery: {},
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
}
  static getIO = () => {
    return this.io;
  };
}
