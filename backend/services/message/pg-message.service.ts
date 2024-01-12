import prisma from "../../config/db";
import { IMessage } from "../../interfaces/message.interface";
import { IObserver } from "../../interfaces/observer.interface";

export class PgMessageService implements IObserver {
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
          messageClientId: messageData.messageClientId
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
    return await prisma.privateMessage
      .create({
        data: {
          message: messageData.message,
          senderId: messageData.senderId,
          recipientId: messageData.recipientId!,
          messageClientId: messageData.messageClientId
        },
      })
      .then((msg) => {
        console.log("Private message saved to DB:", msg);
        return msg.id;
      });
  };
}
