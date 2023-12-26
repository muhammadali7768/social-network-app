export interface IMessage {
    id?: number;
  message: string;
  senderId: string;
  receieverId?: string;
  room?: string;
}
