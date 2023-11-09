const {kafka}= require('./client') 

const producer = kafka.producer();
// When we call this function it will establish a connection to the Kafka cluster
async function connectProducer() {
  console.log("")
  await producer.connect();
}

//When we call this function it will send message to kafka topics
async function sendMessage(room, message) {
  await producer.send({
    topic: room,
    messages: [
      { value: JSON.stringify({ text: message, sender: 'user123' }) },
    ],
  });
}

module.exports = { connectProducer, sendMessage };