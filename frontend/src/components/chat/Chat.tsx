import React, { useState, useEffect } from "react";
import io from "socket.io-client";

type Message={message:string, senderId: string, receieverId?: string, groupId?:string }; 

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [socket, setSocket] = useState<any>(null);
  
  useEffect(() => {
    const socketInstance = io('http://localhost:3001'); 
    setSocket(socketInstance)
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO');
      socketInstance.emit('subscribe', 'chat');
    });   

    socketInstance.on("message", (message: Message) => {
        console.log("message",message)
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
        socketInstance.disconnect();
    };
  },[]);

  const sendMessage = () => {
    const msgObj:Message ={
        message: messageInput,
        senderId: 'ali',
        groupId: 'chat',

    }
    socket.emit("chatMessage", msgObj);
    setMessageInput("");
  };

  return (
    <div className="flex flex-col">
      <div className="border p-4 mb-4">
        {messages.map((msg:Message, index) => (
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
