const { Kafka, logLevel } = require('kafkajs');

exports.kafka = new Kafka({
  clientId: 'chat-app',
  brokers: ['127.0.0.1:9092'],
  logLevel: logLevel.ERROR,
});