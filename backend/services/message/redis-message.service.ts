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
    this.redisClient.rPush(
      `main_chat_messages:${message.senderId}`,
      JSON.stringify(message)
    );
  }
  update(message: IMessage, topic: string): void {
    if (topic === "chat") this.saveMainChatMessage(message);
    else this.savePrivateChatMessage(message);
  }
  async updateMainChatMessage(
    messageId: number,
    messageClientId: string,
    senderId: number
  ) {
    const messages = await this.redisClient.lRange(
      `main_chat_messages:${senderId}`,
      0,
      -1
    );

    // Find the index of the message to update
    const indexToUpdate = messages.findIndex(
      (msg) => JSON.parse(msg).messageClientId === messageClientId
    );

    // Update the message at the identified index
    if (indexToUpdate !== -1) {
      const updatedMessage = JSON.parse(messages[indexToUpdate]);

      this.redisClient.lSet(
        `main_chat_messages:${senderId}`,
        indexToUpdate,
        JSON.stringify({ ...updatedMessage, id: messageId })
      );
    }
  }
}
