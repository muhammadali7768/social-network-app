import { IMessage } from "./message.interface";

export interface IObserver {
    update(message: IMessage, topic:string): void;
  }