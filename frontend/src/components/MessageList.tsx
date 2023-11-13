import React from 'react';

const MessageList = () => {
  const messages = [
    { id: 1, text: 'Hey there!', sender: 'me' },
    { id: 2, text: 'Hi! How are you?', sender: 'other' },
    { id: 3, text: 'I am good, thanks!', sender: 'me' },
    { id: 4, text: 'I am good, thanks!', sender: 'other' },
    { id: 5, text: 'I am good, thanks!', sender: 'me' },
    { id: 6, text: 'This is a long message for testing the UI. Hopefully this will work for long messages too', sender: 'other' },
    { id: 7, text: 'Hey there!', sender: 'me' },
    { id: 8, text: 'Hi! How are you?', sender: 'other' },
    { id: 9, text: 'I am good, thanks!', sender: 'me' },
    { id: 10, text: 'I am good, thanks!', sender: 'other' },
    { id: 11, text: 'I am good, thanks!', sender: 'me' },
    { id: 12, text: 'This is a long message for testing the UI. Hopefully this will work for long messages too', sender: 'other' }
  ];

  return (
    <div className="flex flex-col h-full p-10  overflow-y-auto">
      {messages.map(message => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} mb-2`}
        >
          <div
            className={`${
              message.sender === 'me'
                ? 'bg-green-400 text-white rounded-bl-lg rounded-tl-lg rounded-tr-lg'
                : 'bg-gray-200 text-gray-800 rounded-br-lg rounded-bl-lg rounded-tr-lg'
            } py-2 px-4 max-w-sm break-words`}
          >
            {message.text}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
