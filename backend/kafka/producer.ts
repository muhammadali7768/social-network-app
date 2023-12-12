import {kafka} from '../config/kafka.client' 

const producer = kafka.producer();
// When we call this function it will establish a connection to the Kafka cluster
async function connectProducer() {
  console.log("producer connected")
  await producer.connect();
}

//When we call this function it will send message to kafka topics
async function sendMessage(room:string, message:string) {
  console.log(`Producer sent message: ${message} to topic: ${room}`);
  await producer.send({
    topic: room,
    messages: [
      { value: JSON.stringify({ message: message, sender: 'user123' }), timestamp: Date.now().toString() },
    ],
  });
}
export { connectProducer, sendMessage };