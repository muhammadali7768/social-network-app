import React, { useState, useEffect } from "react";
import { initSocket } from "@/config/socketio";
import { IMessage } from "@/interfaces/message.interface";


const Chat = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  // const [socket, setSocket] = useState<any>(null);
  const socket = initSocket(); 
  useEffect(() => {
    // setSocket(socket)
    socket.on('connect', () => {
      console.log('Connected to Socket.IO');
      socket.emit('subscribe', 'chat');
    });   

    socket.on("message", (message: IMessage) => {
        console.log("message",message)
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
        socket.disconnect();
    };
  },[socket]);

  const sendMessage = () => {
    const msgObj:IMessage ={
        message: messageInput,
        senderId: 'ali',
        room: 'chat',

    }
    socket.emit("chatMessage", msgObj);
    setMessageInput("");
  };

  return (
    <div className="flex flex-col">
      <div className="border p-4 mb-4">
        {messages.map((msg:IMessage, index) => (
          <div key={index} className="mb-2">
            {msg.message}
          </div>
        ))}
      </div>
      <div className="flex items-center border-t p-4">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 mr-2 p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
