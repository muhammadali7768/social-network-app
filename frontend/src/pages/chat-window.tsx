import ChatInput from '@/components/chat/ChatInput'
import ListItem from '@/components/chat/ContactItem'
import ContactList from '@/components/chat/ContactList'
import MessageList from '@/components/chat/MessageList'
import ChatWindowHeader from '@/components/layout/ChatWindowHeader'
import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import useUserStore from '@/hooks/useUserStore'
import { IListUser } from "@/interfaces/auth.interfaces";

export default function ChatWindow() {
  const {getUsers}= useUser()
  const {usersList}= useUserStore()
  const [isGetUsersList, setIsGetUsersList] = useState(false);
  useEffect(()=>{
    if(!isGetUsersList){
      getUsers()
      setIsGetUsersList(true)
    }
  }, [getUsers,isGetUsersList])

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
        <MessageList />
      </div>
      <div className="h-1/6 bg-slate-100 py-6">
        <ChatInput />
      </div>
      </div>
      

      </div>
      </div>



    </div>
    </main>
  )
}
