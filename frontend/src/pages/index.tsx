import Chat from '@/components/chat/Chat'
import Image from 'next/image'
import ListItem from '@/components/chat/ContactItem'
import ContactList from '@/components/chat/ContactList'
import AuthenticationForms from '@/components/auth/AuthenticationForms'

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center`}
    >     
     <AuthenticationForms /> 
    {/* <Chat /> */}
    </main>
  )
}
