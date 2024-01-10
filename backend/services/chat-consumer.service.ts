import {
  Consumer,
  ConsumerSubscribeTopics,
  EachMessagePayload,
} from "kafkajs";
import { Server } from "socket.io";

import { kafka } from "../config/kafka.client";
import { IMessage } from "../interfaces/message.interface";
import { RedisClient } from "../config/redis";
import {generatePrivateChatRoomName} from "../utils/room-names";
import {
  MessageService
} from "../services/message/pg-message.service";
import { IObserver } from "../interfaces/observer.interface";

// ISubject/Publisher Interface
interface ISubject {
  subscribe(observer: IObserver): void;
  unsubscribe(observer: IObserver): void;
  notifySubscribers(message:IMessage, topic:string): void;
}

export class ChatConsumer implements ISubject{
  private observers: IObserver[] = [];
  private kafkaConsumer: Consumer;
  private subscribedTopic: string[];
  private socket: Server;

  public constructor(io: Server) {
    this.kafkaConsumer = this.createKafkaConsumer();
    this.subscribedTopic = [];
    this.socket = io;
  }

  subscribe(observer: IObserver): void {
    this.observers.push(observer)
  }
  unsubscribe(observer: IObserver): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }
  notifySubscribers(message:IMessage, topic:string): void {
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
          this.notifySubscribers({...messageData, id: message.offset}, topic)
          // if (topic === "chat") {
          //   await this.storeAndEmitMainChatMessage(messageData);
          // } else if (topic === "private_chat") {
          //   await this.storeAndEmitPrivateMessage(messageData);
          // }
        }
      },
    });
  }

  // public async storeAndEmitMainChatMessage(messageData: IMessage) {
  //   let msgId = await saveMessage(messageData);
  //   this.socket.emit("message", { ...messageData, id: msgId });
  //   console.log("MSGID", msgId);
  //   RedisClient.getInstance()
  //     .getRedisClient()
  //     .rPush(`main_chat_messages`, JSON.stringify(messageData));
  // }

  // public async storeAndEmitPrivateMessage(messageData: IMessage) {
  //   let recipientId = messageData.recipientId!.toString();
  //   let senderId = messageData.senderId.toString();

  //   let msgId = await savePrivateMessage(messageData);

  //   this.socket
  //     .to(recipientId)
  //     .to(senderId)
  //     .emit("message", { ...messageData, id: msgId });
  //   const roomName = generatePrivateChatRoomName(messageData.senderId, messageData.recipientId!);
  //   RedisClient.getInstance()
  //     .getRedisClient()
  //     .rPush(roomName, JSON.stringify(messageData));
  // }
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
