import { Server } from 'socket.io';

let io;
const initializeSocket=async(server) =>{
    console.log("socketio initializing...")
   io = new Server(server, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });
//   return io;
}
function getIO(fileName) {
    if (!io) {
      console.log('Socket.io has not been initialized yet', fileName);      
    }
    return io;
  } 

export { initializeSocket, getIO};
