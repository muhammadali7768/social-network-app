export interface IMessage {
  id?:string
  messageClientId:string
  room: string;
  message: string;
  senderId:number;
  recipientId?:number
}
