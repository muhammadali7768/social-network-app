import { Server } from "socket.io";
import { SocketIO } from "../../config/socketio";
import { IMessage } from "../../interfaces/message.interface";
import { IObserver } from "../../interfaces/observer.interface";

import { IUser } from "../../interfaces/user.interface";

interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void;
}
interface IAuthUser {
  user: IUser;
}

export class SocketMessageService implements IObserver {
  protected socketio: Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    IAuthUser
  >;
  constructor() {
    this.socketio = SocketIO.getIO();
  }
  emitPrivateChatMessage(message: IMessage) {
    let recipientId = message.recipientId?.toString();
    let senderId = message.senderId.toString();
    this.socketio.to(recipientId!).to(senderId).emit("message", message);
  }
  emitMainChatMessage(message: IMessage) {
    console.log("Main Chat message in socket service", message)
    this.socketio.emit("message", message);
  }
  update(message: IMessage, topic: string): void {
    console.log("Socket Update is called")
    if (topic === "chat") this.emitMainChatMessage(message);
    else this.emitPrivateChatMessage(message);
  }
}
