export interface IMessage {
  id?: number;
  messageClientId?: string;
  message: string;
  senderId: number;
  recipientId?: number;
  room?: string;
}
