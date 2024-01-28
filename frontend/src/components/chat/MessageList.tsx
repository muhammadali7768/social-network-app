import React, { useEffect, useRef } from 'react';
import { IMessage } from '@/interfaces/message.interface';
import useUserStore from "@/hooks/useUserStore";
interface IProps {
  messages: IMessage[]
}
const MessageList = ({messages}:IProps) => {
  const user= useUserStore(state=>state.user)
  const isMe=(senderId:number)=>{
    return senderId===user?.id
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);
  return (
    <div className="flex flex-col h-full p-10  overflow-y-auto">
      {messages.map((message:IMessage) => (
        <div
          key={message.id}
          className={`flex ${isMe(message.senderId) ? 'justify-end' : 'justify-start'} mb-2`}
        >
           <div className='flex flex-col'>
          {!isMe(message.senderId) && <span className='text-green-500 text-sm'>{message.sender?.username}</span>}
          <div
            className={`${
              isMe(message.senderId)
                ? 'bg-green-500 text-white rounded-bl-lg rounded-tl-lg rounded-tr-lg'
                : 'bg-gray-200 text-gray-800 rounded-br-lg rounded-bl-lg rounded-tr-lg'
            } py-2 px-4 max-w-sm break-words`}
          >
           
         
           {message.id} {message.message}
          </div>
        </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
