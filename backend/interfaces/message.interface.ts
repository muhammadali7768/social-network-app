export interface IMessage {
  room: string;
  message: string;
  senderId:number;
  recipientId?:number
}
