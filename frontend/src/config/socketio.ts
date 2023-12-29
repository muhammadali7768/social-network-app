import { io, Socket } from "socket.io-client";
let socket: Socket;


export const initSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_API!,  { autoConnect: false });
  }
  return socket;
};
