const { Kafka, logLevel } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'chat-app',
  brokers: ['192.168.48.13:9092'],
  logLevel: logLevel.ERROR,
});

export default kafka