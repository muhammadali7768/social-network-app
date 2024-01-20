import { Server } from "socket.io";
import prisma from "../../config/db";
import { IMessage } from "../../interfaces/message.interface";
import { IObserver } from "../../interfaces/observer.interface";
import { RedisMessageService } from "./redis-message.service";
import { SocketMessageService } from "./socket.message.service";



export class PgMessageService implements IObserver {
  protected redisMessageService: RedisMessageService;
  protected socketMessageService: SocketMessageService;
  constructor() {
    this.redisMessageService = new RedisMessageService();
    this.socketMessageService = new SocketMessageService();
  }
  update(message: IMessage, topic: string): void {
    if (topic === "chat") this.saveMainChatMessage(message);
    else this.savePrivateMessage(message);
  }
  saveMainChatMessage = async (messageData: IMessage) => {
    let msgId = await prisma.mainRoomMessage
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
    this.redisMessageService.updateMainChatMessage(
      msgId,
      messageData.messageClientId,
      messageData.senderId
    );
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
    console.log("Saving Private Message in pg", messageData);
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
    this.socketMessageService.emitPrivateMessageUpdate(
      messageData.senderId,
      msgId,
      messageData.messageClientId
    );
    return msgId;
  };
}
