import {
  Consumer,
  ConsumerSubscribeTopics,
  Kafka,
  EachMessagePayload,
  EachBatchPayload,
} from "kafkajs";
import { Server } from "socket.io";
// import { SocketIO } from "../config/socketio";
import { kafka } from "../config/kafka.client";
export class ChatConsumer {
  private kafkaConsumer: Consumer;
  private subscribedTopic: string;
  private socket:Server

  public constructor(io:Server) {
    this.kafkaConsumer = this.createKafkaConsumer();
    this.subscribedTopic = "";
    this.socket=io;
  }

  public async subscribeToTopic(topicName: string) {
    const topic: ConsumerSubscribeTopics = {
      topics: [`${topicName}`],
      fromBeginning: true,
    };

    if (this.subscribedTopic != topicName) {
      await this.kafkaConsumer.subscribe(topic);
      console.log("already subscribed")
    }
    this.subscribedTopic = topicName;
    await this.kafkaConsumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic, partition, message } = messagePayload;
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
        console.log(`- ${prefix} ${message.key}#${message.value}`);
        if (message.value) {
          const stringValue = message.value.toString("utf8") ?? "";
         const messageData = JSON.parse(stringValue)
          this.socket.emit('message', {...messageData, id:message.offset})           
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
  public async getChatMessages(topic: string, partition: number, offset: string) {
    // let messages: {}[] = [];
    try {
      //   this.kafkaConsumer.run({
      //     autoCommit: false,
      //     eachMessage: async ({ topic, message }) =>  Promise.resolve()
      // })
      //   await this.kafkaConsumer.seek({
      //     topic,
      //     partition: partition,
      //     offset: offset,
      //   });
      const messages: {}[] = []
      await this.kafkaConsumer
        .run({
          // eachMessage: async ({ topic, partition, message }) => {
          //   if(message.value){
          //   const stringValue = message.value.toString('utf8') ?? '';
          //   console.log("consumer message", stringValue)
          //   messages.push(JSON.parse(stringValue));
          //   }
          // },
          eachBatch: async (eachBatchPayload: EachBatchPayload) => {
            const { batch } = eachBatchPayload;
            for (const message of batch.messages) {
              const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
              console.log(`- ${prefix} ${message.key}#${message.value}`);
              if (message.value) {
                const stringValue = message.value.toString("utf8") ?? "";
                //   console.log("consumer message", stringValue)
                messages.push(JSON.parse(stringValue));                
              }
            }
          },
        })
  
      return { messages: messages };
    } catch (error) {
      console.log("Error while getting kafka messages", error);
    }
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
