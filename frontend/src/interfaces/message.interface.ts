import { IListUser } from "./auth.interfaces";

export interface IMessage {
  id?: number;
  messageClientId?: number;
  message: string;
  senderId: number;
  sender?:IListUser
  recipientId?: number;
  room?: string;
}
