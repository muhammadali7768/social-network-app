export interface IMessage {
    id?: number;
  message: string;
  senderId: number;
  recipientId?: string;
  room?: string;
}
