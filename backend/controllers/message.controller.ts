import prisma from "../config/db";
import { IMessage } from "../interfaces/message.interface";

const saveMessage = (messageData:IMessage) => {
    prisma.mainRoomMessage.create({
        data: {
          message: messageData.message,
          senderId: messageData.senderId
        }
      }).then((msg) => {
        console.log("Message Saved to DB:", msg);
      })  
};

const getMainRoomMessages=async()=>{
   return await prisma.mainRoomMessage.findMany({
    }).then(messages=>{
        return messages
    })
}
const getPrivateMessages=(senderId:number,recipientId:number)=>{
    prisma.privateMessage.findMany({
        where:{
            senderId,
            recipientId
        }
    }).then(messages=>{
        return messages
    })
}
const savePrivateMessage=(messageData:IMessage)=>{
    prisma.privateMessage.create({
        data: {
          message: messageData.message,
          senderId: messageData.senderId,
          recipientId: messageData.recipientId!
        }
      }).then((msg) => {
        console.log("Private message saved to DB:", msg);
      }) 
}
export { saveMessage, getMainRoomMessages, getPrivateMessages, savePrivateMessage };
