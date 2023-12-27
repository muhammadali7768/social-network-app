export interface IMessage {
    id?: number;
  message: string;
  senderId: number;
  receieverId?: string;
  room?: string;
}
