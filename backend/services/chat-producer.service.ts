import {
  Kafka,
  Message,
  Producer,
  ProducerBatch,
  TopicMessages,
} from "kafkajs";
import { kafka } from "../config/kafka.client";
import { IMessage } from "../interfaces/message.interface";

export class ChatProducer {
  private producer: Producer;

  constructor() {
    this.producer = this.createProducer();
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (error) {
      console.log("Error connecting the producer: ", error);
    }
  }

  public async stop(): Promise<void> {
    await this.producer.disconnect();
  }

  async sendMainChatMessage(messageData: IMessage) {
    const { id, message, senderId, messageClientId, room } = messageData;
    await this.producer.send({
      topic: room,
      messages: [
        {
          value: JSON.stringify({
            id,
            message,
            senderId,
            messageClientId,
          }),
          timestamp: Date.now().toString(),
          partition: 0,
        },
      ],
    });
  }

  async sendPrivateMessage(messageData: IMessage) {
    const { id, message, senderId, recipientId, messageClientId, room } =
      messageData;
    await this.producer.send({
      topic: room,
      messages: [
        {
          value: JSON.stringify({
            id,
            message,
            senderId,
            recipientId,
            messageClientId,
          }),
          timestamp: Date.now().toString(),
          partition: 0,
        },
      ],
    });
  }

  private createProducer(): Producer {
    return kafka.producer();
  }
}
