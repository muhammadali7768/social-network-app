export interface IMessage {
  id:number
  messageClientId:number
  room: string;
  message: string;
  senderId:number;
  recipientId?:number
}
