export interface IMessage {
    id?: number;
  message: string;
  senderId: number;
  recipientId?: number;
  room?: string;
}
