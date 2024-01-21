export interface IMessage {
  id?: number;
  messageClientId?: number;
  message: string;
  senderId: number;
  recipientId?: number;
  room?: string;
}
