import prisma from "../config/db";
import { Request, Response } from "express";
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
export { saveMessage, getMainRoomMessages, getPrivateMessages };
