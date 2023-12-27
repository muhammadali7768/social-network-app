import React from 'react';
import { IMessage } from '@/interfaces/message.interface';
import useUserStore from "@/hooks/useUserStore";
interface IProps {
  messages: IMessage[]
}
const MessageList = ({messages}:IProps) => {

  const {user}= useUserStore()
  return (
    <div className="flex flex-col h-full p-10  overflow-y-auto">
      {messages.map((message:IMessage) => (
        <div
          key={message.id}
          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'} mb-2`}
        >
          <div
            className={`${
              message.senderId === user?.id
                ? 'bg-green-400 text-white rounded-bl-lg rounded-tl-lg rounded-tr-lg'
                : 'bg-gray-200 text-gray-800 rounded-br-lg rounded-bl-lg rounded-tr-lg'
            } py-2 px-4 max-w-sm break-words`}
          >
            {message.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
