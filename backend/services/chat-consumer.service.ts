import { Consumer, ConsumerSubscribeTopics, EachMessagePayload } from "kafkajs";
import { Server } from "socket.io";

import { kafka } from "../config/kafka.client";
import { IMessage } from "../interfaces/message.interface";

import { ISubject } from "../interfaces/observer-subject.interface";
import { IObserver } from "../interfaces/observer.interface";

export class ChatConsumer implements ISubject {
  private observers: IObserver[] = [];
  private kafkaConsumer: Consumer;
  private subscribedTopic: string[];


  public constructor(io: Server) {
    this.kafkaConsumer = this.createKafkaConsumer();
    this.subscribedTopic = [];
  }

  subscribe(observer: IObserver): void {
    this.observers.push(observer);
  }
  unsubscribe(observer: IObserver): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }
  notifySubscribers(message: IMessage, topic: string): void {
    console.log("Message in notify",message)
    this.observers.forEach((observer) => observer.update(message, topic));
  }
  public async subscribeToTopic(topicName: string) {
    const topic: ConsumerSubscribeTopics = {
      topics: [`${topicName}`],
      fromBeginning: true,
    };

    if (!this.subscribedTopic.includes(topicName)) {
      await this.kafkaConsumer.subscribe(topic);
      console.log("already subscribed");
    }
    this.subscribedTopic.push(topicName);
    await this.kafkaConsumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic, partition, message } = messagePayload;
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
        console.log(`- ${prefix} ${message.key}#${message.value}`);
        if (message.value) {
          const stringValue = message.value.toString("utf8") ?? "";
          const messageData: IMessage = JSON.parse(stringValue);
          console.log("Consumer Message",messageData)
          this.notifySubscribers(messageData , topic);
        }
      },
    });
  }
  public async startConsumer(): Promise<void> {
    try {
      await this.kafkaConsumer.connect();
      console.log("kafka consumer connected");
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

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect();
  }

  private createKafkaConsumer(): Consumer {
    try {
      const consumer = kafka.consumer({ groupId: "consumer-group" });
      console.log("Consumer group started");
      return consumer;
    } catch (error) {
      console.log("Error creating kafka consumer", error);
      throw error;
    }
  }
}
