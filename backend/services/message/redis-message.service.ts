import { IMessage } from "../../interfaces/message.interface";
import { RedisClient } from "../../config/redis";
import { RedisClientType } from "redis";
import { IObserver } from "../../interfaces/observer.interface";


export class RedisMessageService implements IObserver {
  public redisClient: RedisClientType;

  constructor() {
    this.redisClient = RedisClient.getInstance().getRedisClient();
  }
  update(message: IMessage): void {
    this.redisClient.rPush(`main_chat_messages`, JSON.stringify(message));
  }
}
