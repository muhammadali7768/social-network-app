import React from 'react';

const ChatInput = () => {
  return (
    <div className="flex items-center py-2 px-4">
      <input
        type="text"
        placeholder="Type a message"
        className="w-full bg-white rounded-full py-2 px-4 outline-none"
      />
      <button className="ml-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full py-2 px-4">
        Send
      </button>
    </div>
  );
};

export default ChatInput;