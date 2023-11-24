import { useAuth } from '@/hooks/useAuth';
import React from 'react';

const ChatWindowHeader = () => {
    const {logout}= useAuth()
  const handleLogout = () => {
    logout();
  };

  const handleClose = () => {
    console.log('Close clicked');
  };

  return (
    <div>
       <div className="fixed top-2 right-4 flex space-x-2">
      <button
        className="group w-10 h-10 opacity-20 hover:opacity-100"
        onClick={handleLogout}
      >
     <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-linecap="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 3.25C12.4142 3.25 12.75 3.58579 12.75 4C12.75 4.41421 12.4142 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25C12.4142 19.25 12.75 19.5858 12.75 20C12.75 20.4142 12.4142 20.75 12 20.75C7.16751 20.75 3.25 16.8325 3.25 12C3.25 7.16751 7.16751 3.25 12 3.25Z" fill="#1C274C"></path> <path d="M16.4697 9.53033C16.1768 9.23744 16.1768 8.76256 16.4697 8.46967C16.7626 8.17678 17.2374 8.17678 17.5303 8.46967L20.5303 11.4697C20.8232 11.7626 20.8232 12.2374 20.5303 12.5303L17.5303 15.5303C17.2374 15.8232 16.7626 15.8232 16.4697 15.5303C16.1768 15.2374 16.1768 14.7626 16.4697 14.4697L18.1893 12.75H10C9.58579 12.75 9.25 12.4142 9.25 12C9.25 11.5858 9.58579 11.25 10 11.25H18.1893L16.4697 9.53033Z" fill="#1C274C"></path> </g></svg>
       <span className="w-24 absolute top-10 bg-white px-2 py-3 shadow-2xl border border-gray-200 rounded-bl-lg rounded-tl-lg rounded-br-lg -right-96 flex items-center justify-center opacity-0  group-hover:right-20 group-hover:opacity-100 transition-opacity duration-300">
          Logout
        </span>
       </button>
      <button
        className="group w-10 h-10 opacity-20 hover:opacity-100"
        onClick={handleClose}
      >
       <svg viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-linecap="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#1C274C" stroke-linecap="1.5" strokeLinecap="round" stroke-linejoin="round"></path> <path d="M9.16998 14.83L14.83 9.17004" stroke="#1C274C" stroke-linecap="1.5" strokeLinecap="round" stroke-linejoin="round"></path> <path d="M14.83 14.83L9.16998 9.17004" stroke="#1C274C" strokeLinecap="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
       <span className="w-32 absolute top-10 bg-white px-2 py-3 shadow-2xl border border-gray-200 rounded-bl-lg rounded-tl-lg rounded-br-lg -right-96 flex items-center justify-center opacity-0  group-hover:right-5 group-hover:opacity-100 transition-opacity duration-300">
          Close window
        </span>
       </button>
    </div>
    </div>
  );
};

export default ChatWindowHeader;
