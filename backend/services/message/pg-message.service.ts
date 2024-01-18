import { Server } from "socket.io";
import prisma from "../../config/db";
import { IMessage } from "../../interfaces/message.interface";
import { IObserver } from "../../interfaces/observer.interface";
import { SocketIO } from "../../config/socketio";
import { IUser } from "../../interfaces/user.interface";

interface DefaultEventsMap {
  [event: string]: (...args: any[]) => void;
}
interface IAuthUser {
  user: IUser;
}


export class PgMessageService implements IObserver {
  protected socket: Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  IAuthUser
>;
  constructor() {
    this.socket = SocketIO.getIO();
  }
  update(message: IMessage, topic: string): void {
    if (topic === "chat") this.saveMessage(message);
    else this.savePrivateMessage(message);
  }
  saveMessage = async (messageData: IMessage) => {
    return await prisma.mainRoomMessage
      .create({
        data: {
          message: messageData.message,
          senderId: messageData.senderId,
        },
      })
      .then((msg) => {
        console.log("Message Saved to DB:", msg);
        return msg.id;
      });
  };

  getMainRoomMessages = async () => {
    return await prisma.mainRoomMessage.findMany({}).then((messages) => {
      return messages;
    });
  };
  getPrivateMessages = (senderId: number, recipientId: number) => {
    prisma.privateMessage
      .findMany({
        where: {
          senderId,
          recipientId,
        },
      })
      .then((messages) => {
        return messages;
      });
  };
  savePrivateMessage = async (messageData: IMessage) => {
    console.log("Saving Private Message in pg",messageData)
    const msgId = await prisma.privateMessage
      .create({
        data: {
          message: messageData.message,
          senderId: messageData.senderId,
          recipientId: messageData.recipientId!,
        },
      })
      .then((msg) => {
        console.log("Private message saved to DB:", msg);
        return msg.id;
      });
      //Send message confirmation event to the sender
    this.socket.to(messageData.senderId.toString()).emit("messageReceivedByServer", {
      messageId: msgId,
      messageClientId: messageData.messageClientId,
    });
    return msgId;
  };
}
