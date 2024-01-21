import React, { useState } from "react";
import { initSocket } from "@/config/socketio";
import { IMessage } from "@/interfaces/message.interface";
import useUserStore from "@/hooks/useUserStore";
import crypto from 'crypto';
//index 0 means main chat and when it's greater than 0 then it means user id
const ChatInput = ({ index }: { index: number }) => {
  const chatRoom = index === 0 ? "chat" : "private_chat";
  const [message, setMessage] = useState("");
  const socket = initSocket();
  const user = useUserStore((state) => state.user);
  const generateUniqueID=(userId:number)=> {
    const timestamp = Math.floor(Date.now() / 1000); 
    const shortNumericValue = Math.floor(Math.random() * 10000); 
  
    const dataToHash = `${userId}-${timestamp}-${shortNumericValue}`;
  
    const hash = crypto.createHash('sha256');
  
    hash.update(dataToHash);
    const hexHash = hash.digest('hex');  
    
    const decimalValue = parseInt(hexHash.substring(0, 8), 16);
  
    return decimalValue;
  }
  const sendMessage = () => {
    console.log("User", user);
    if (message.trim() !== "" && user?.id) {
      console.log("message is not empty");
      const uniqueId=generateUniqueID(user?.id);
      const msgObj: IMessage = {
        id: uniqueId, // This id is for client side rendering 
        message: message,
        senderId: user.id,
        messageClientId: uniqueId,
        room: chatRoom,
        recipientId: index, //We will discard the recipientId for main chat and will use it for PM
      };
      console.log("Message sending",msgObj)
      if (index === 0) socket.emit("mainChatMessage", msgObj);
      else socket.emit("privateChatMessage", msgObj);
      setMessage("");
    }
  };
  return (
    <div className="flex items-center py-2 px-4">
      <input
        type="text"
        placeholder="Type a message"
        className="w-full bg-white rounded-full py-2 px-4 outline-none"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button
        className="ml-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full py-2 px-4"
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
