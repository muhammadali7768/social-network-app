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
    const { senderId, message, messageClientId } = messageData;
    let msgId = await prisma.mainRoomMessage
      .create({
        data: {
          message: message,
          senderId: senderId,
        },
      })
      .then((msg) => {
        console.log("Message Saved to DB:", msg);
        return msg.id;
      });

    this.socketMessageService.emitMainChatMessageUpdate(
      senderId,
      msgId,
      messageClientId
    );
    this.redisMessageService.updateMainChatMessage(
      msgId,
      messageClientId,
      senderId
    );
  };

  savePrivateMessage = async (messageData: IMessage) => {
    const { message, senderId, recipientId, messageClientId } = messageData;
    if (!recipientId) return;
    const msgId = await prisma.privateMessage
      .create({
        data: {
          message: message,
          senderId: senderId,
          recipientId: recipientId,
        },
      })
      .then((msg) => {
        console.log("Private message saved to DB:", msg);
        return msg.id;
      });
    this.socketMessageService.emitPrivateChatMessageUpdate(
      senderId,
      recipientId,
      msgId,
      messageClientId
    );
    this.redisMessageService.updatePrivateChatMessage(
      msgId,
      messageClientId,
      senderId,
      recipientId
    );
    return msgId;
  };

  getMainRoomMessages = async () => {
    return await prisma.mainRoomMessage
      .findMany({ include: { sender: { select: {id: true, username: true}} } })
      .then((messages) => {
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
}
