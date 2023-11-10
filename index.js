const express = require("express");
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors)
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { connectProducer, sendMessage } = require("./kafka/producer");
const { connectConsumer, subscribeToRoom } = require("./kafka/consumer");
const { createTopics } = require("./kafka/admin");
// Route for sending chat messages to Kafka
app.post("/send/:room", async (req, res) => {
  const { room } = req.params;
  const { message } = req.body;
  createTopics(room);
  try {
    await sendMessage(room, message);
    res.status(200).send("Message sent to Kafka");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

io.on("connection", (socket) => {
  socket.on("subscribe", (room) => {
    subscribeToRoom(room);
  });
});

http.listen(3000, async () => {
  await connectProducer(); // Connect the Kafka producer
  await connectConsumer(); // Connect the Kafka consumer

  console.log("Server is running on port 3000");
});
