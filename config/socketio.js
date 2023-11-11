const socketIO = require('socket.io');

let io;
function initializeSocket(server) {
   io = socketIO(server, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET', 'POST'],
      // allowedHeaders: ['my-custom-header'],
      credentials: true,
    }
  });

  // Define any specific event handlers or configuration related to Socket.IO here

  return io;
}

module.exports = { initializeSocket, getIO: () => io };
