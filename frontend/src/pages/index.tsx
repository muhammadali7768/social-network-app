import Chat from '@/components/Chat'
import Image from 'next/image'
import ListItem from '@/components/ContactItem'

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center`}
    >     
    <div className='flex flex-col h-screen w-full gap-4 bg-slate-300'>
      <div className='flex flex-row w-full h-screen bg-slate-100'>
        {/* Contact List Starts */}
      <div className="basis-1/4 border overflow-y-auto">
      <nav className="py-4 px-6 text-sm font-medium">
       <label>Contant List</label>
    </nav>
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      </div> {/* Contact List Ends */}
      <div className="basis-3/4 border">
      <div className='flex flex-col w-full h-screen bg-white'>
      <div className="h-5/6">Messages List</div>
      <div className="h-1/6 bg-slate-50">Message INput</div>
      </div>
      

      </div>
      </div>



    </div>
    </main>
  )
}
