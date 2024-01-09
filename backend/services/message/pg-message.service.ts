import prisma from "../../config/db";
import { IMessage } from "../../interfaces/message.interface";
import { IObserver } from "../../interfaces/observer.interface";

export class MessageService implements IObserver {
  update(message: IMessage): void {
    this.saveMessage(message)
  }
 saveMessage = async(messageData:IMessage) => {
    return await prisma.mainRoomMessage.create({
        data: {
          message: messageData.message,
          senderId: messageData.senderId
        }
      }).then((msg) => {
        console.log("Message Saved to DB:", msg);
        return msg.id
      })  
};

 getMainRoomMessages=async()=>{
   return await prisma.mainRoomMessage.findMany({
    }).then(messages=>{
        return messages
    })
}
 getPrivateMessages=(senderId:number,recipientId:number)=>{
    prisma.privateMessage.findMany({
        where:{
            senderId,
            recipientId
        }
    }).then(messages=>{
        return messages
    })
}
 savePrivateMessage=async(messageData:IMessage)=>{
   return await prisma.privateMessage.create({
        data: {
          message: messageData.message,
          senderId: messageData.senderId,
          recipientId: messageData.recipientId!
        }
      }).then((msg) => {
        console.log("Private message saved to DB:", msg);
        return msg.id
      }) 
}
}
