import {
  Consumer,
  ConsumerSubscribeTopics,
  Kafka,
  EachMessagePayload,
} from "kafkajs";

import { kafka } from "../config/kafka.client";
export class ChatConsumer {
  private kafkaConsumer: Consumer;
  private subscribedTopic: string;

  public constructor() {
    this.kafkaConsumer = this.createKafkaConsumer();
    this.subscribedTopic = "";
  }

  public async subscribeToTopic(topicName: string) {
    const topic: ConsumerSubscribeTopics = {
      topics: [`${topicName}`],
      fromBeginning: false,
    };

    if (this.subscribedTopic != topicName) {
      await this.kafkaConsumer.subscribe(topic);
    }
    this.subscribedTopic = topicName;
    await this.kafkaConsumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic, partition, message } = messagePayload;
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
        console.log(`- ${prefix} ${message.key}#${message.value}`);
      },
    });

    this.getMessageHistory(topicName);
  }
  public async startConsumer(): Promise<void> {
    try {
      await this.kafkaConsumer.connect();
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  public async getMessageHistory(topic: string) {
    await this.kafkaConsumer.seek({ topic, partition: 0, offset: "0" });
    await this.kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("Message History");
        // Emit each received message to the Socket.IO client
        // io.to(topic).emit('message', message.value?.toString());
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
        console.log(`- ${prefix} ${message.key}#${message.value}`);
      },
    });
  }
  public async getMessages(topic: string, partition: number, offset: string) {
    let messages: {}[] = [];

    await this.kafkaConsumer.seek({
      topic,
      partition: partition,
      offset: offset,
    });
    await this.kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        messages.push(message);
      },
    });
    return { messages: messages };
  }
  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect();
  }

  private createKafkaConsumer(): Consumer {
    const consumer = kafka.consumer({ groupId: "consumer-group" });
    return consumer;
  }
}
