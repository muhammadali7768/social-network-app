import React, {useState} from 'react';
import { initSocket } from '@/config/socketio'
import { IMessage } from '@/interfaces/message.interface';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const socket=initSocket()
  const sendMessage=()=>{
    if (message.trim() !== '') {
      const msgObj:IMessage ={
        message: message,
        senderId: 'ali',
        room: 'chat',

    }
      socket.emit('chatMessage', msgObj);
      setMessage('');
    }
  }
  return (
    <div className="flex items-center py-2 px-4">
      <input
        type="text"
        placeholder="Type a message"
        className="w-full bg-white rounded-full py-2 px-4 outline-none"
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
      />
      <button 
      className="ml-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full py-2 px-4"
      onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;