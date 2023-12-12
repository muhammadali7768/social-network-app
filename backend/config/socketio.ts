import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

export class SocketIO {
  public io: Server;
  constructor(server: HttpServer) {
    this.io = new Server(server, {
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
