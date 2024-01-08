import React, { useState } from "react";
import { initSocket } from "@/config/socketio";
import { IMessage } from "@/interfaces/message.interface";
import useUserStore from "@/hooks/useUserStore";
//index 0 means main chat and when it's greater than 0 then it means user id
const ChatInput = ({ index }: { index: number }) => {
  const chatRoom = index === 0 ? "chat" : "private_chat";
  const [message, setMessage] = useState("");
  const socket = initSocket();
  const user = useUserStore((state) => state.user);

  const sendMessage = () => {
    console.log("User", user);
    if (message.trim() !== "") {
      console.log("message is not empty");
      const msgObj: IMessage = {
        message: message,
        senderId: user!.id,
        room: chatRoom,
        recipientId: index, //We will discard the recipientId for main chat and will use it for PM
      };
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
