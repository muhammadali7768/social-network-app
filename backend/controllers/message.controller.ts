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

const getMainRoomMessages=(senderId:number,recipientId:number)=>{
    prisma.mainRoomMessage.findMany({
    }).then(messages=>{
        return messages
    })
}
export { saveMessage, getMainRoomMessages };
