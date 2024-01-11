import { IMessage } from "./message.interface";
import { IObserver } from "./observer.interface";

export interface ISubject {
    subscribe(observer: IObserver): void;
    unsubscribe(observer: IObserver): void;
    notifySubscribers(message:IMessage, topic:string): void;
  }