import { IMessage } from "../../interfaces/message.interface";
import { RedisClient } from "../../config/redis";
import { RedisClientType } from "redis";
import { IObserver } from "../../interfaces/observer.interface";
import { generatePrivateChatRoomName } from "../../utils/room-names";

export class RedisMessageService implements IObserver {
  public redisClient: RedisClientType;

  constructor() {
    this.redisClient = RedisClient.getInstance().getRedisClient();
  }
  savePrivateChatMessage(message: IMessage) {
    const roomName = generatePrivateChatRoomName(
      message.senderId,
      message.recipientId!
    );
    this.redisClient.rPush(roomName, JSON.stringify(message));
  }
  saveMainChatMessage(message: IMessage) {
    this.redisClient.rPush(`main_chat_messages`, JSON.stringify(message));
  }
  update(message: IMessage, topic: string): void {
    if (topic === "chat") this.saveMainChatMessage(message);
    else this.savePrivateChatMessage(message);
  }
}
