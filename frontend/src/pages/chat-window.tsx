import ChatInput from '@/components/chat/ChatInput'
import ListItem from '@/components/chat/ContactItem'
import ContactList from '@/components/chat/ContactList'
import MessageList from '@/components/chat/MessageList'
import ChatWindowHeader from '@/components/layout/ChatWindowHeader'
import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import useUserStore from '@/hooks/useUserStore'
import { IListUser } from "@/interfaces/auth.interfaces";
import { initSocket } from '@/config/socketio'
import { IMessage } from '@/interfaces/message.interface'

export default function ChatWindow() {
  const {getUsers}= useUser()
  const {usersList}= useUserStore()
  const [isGetUsersList, setIsGetUsersList] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const socket=initSocket();
  useEffect(()=>{
    if(!isGetUsersList){
      getUsers()
      setIsGetUsersList(true)
    }
  }, [getUsers,isGetUsersList])

  useEffect(()=>{
    socket.connect()
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
  },[socket])

 
  return (
    <main
      className={`flex min-h-screen flex-col items-center`}
    >     
    <ChatWindowHeader />
    <div className='flex flex-col h-screen w-full gap-4 bg-slate-300 overflow-hidden'>
      <div className='flex flex-row w-full h-screen bg-slate-100'>
        {/* Contact List Starts */}
      <div className="basis-1/4 border  overflow-y-auto">
      <nav className="py-4 px-6 text-sm font-medium">
       <label>Contant List</label>
    </nav>
    <ContactList>
      {usersList && usersList.map((user:IListUser)=>{
       return <ListItem key={user.username} {...user} /> 
      })}
      </ContactList>
      </div> {/* Contact List Ends */}
      <div className="basis-3/4 border">
      <div className='flex flex-col w-full h-screen bg-white'>
      <div className="h-5/6">
        <MessageList messages={messages} />
      </div>
      <div className="h-1/6 bg-slate-100 py-6">
        <ChatInput/>
      </div>
      </div>
      

      </div>
      </div>



    </div>
    </main>
  )
}
