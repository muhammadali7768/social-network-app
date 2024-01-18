import { io, Socket } from "socket.io-client";
import { IMessage } from "../interfaces/message.interface";
import { IListUser } from "@/interfaces/auth.interfaces";
interface ServerToClientEvents {
  messageHistory: (messages: IMessage[]) => void;
  messageReceivedByServer: (messageData:any)=>void
  message: (message: IMessage) => void;
  userConnected: (user: IListUser) => void;
  users: (users:IListUser[])=>void
  userDisconnected: (userId: number) => void;
  reconnect:()=>void
}

interface ClientToServerEvents {
  subscribe: (roomName: string) => void;
  mainChatMessage: (message:IMessage)=>void
  privateChatMessage: (message:IMessage)=>void
}
let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export const initSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_API!, { withCredentials:true, autoConnect: false , transports: ['websocket'], upgrade: false});
  }
  return socket;
};
