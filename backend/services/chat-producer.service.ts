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

  async sendMainChatMessage(message: IMessage) {
    await this.producer.send({
      topic: message.room,
      messages: [
        {
          value: JSON.stringify({
            message: message.message,
            senderId: message.senderId,
          }),
          timestamp: Date.now().toString(),
          partition: 0,
        },
      ],
    });
  }

  async sendPrivateMessage(message: IMessage) {
    await this.producer.send({
      topic: message.room,
      messages: [
        {
          value: JSON.stringify({
            message: message.message,
            senderId: message.senderId,
            recipientId: message.recipientId,
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
