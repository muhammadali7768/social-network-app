import Image from "next/image";
import { IListUser } from "@/interfaces/auth.interfaces";
import useUserStore from "@/hooks/useUserStore";
const dummyUser={
    image: '/man.png',
    title: "Muhammad Ali",
    icon: "ok"
}
export default function ListItem({user, isActive, onShow}: {user:IListUser, isActive:boolean, onShow:()=>void}) {
  const statusColor=user.status==="online"? 'bg-green-500' : 'bg-orange-300';
  const activeColor=isActive? "bg-slate-50" : "bg-white"
  const storeUser=useUserStore(state=>state.user);
  const me=storeUser?.id===user.id? "(You)" : "";
    return (
      <article onClick={onShow} className={`flex items-start space-x-6 px-6 py-3 ${activeColor} hover:bg-slate-50 hover:cursor-pointer`}>
        <Image src={dummyUser.image} alt="" width="60" height="60" className="flex-none w-14 h-14 rounded-md" />
        <div className="min-w-0 relative flex-auto">
          <h2 className="font-semibold text-slate-900 truncate pr-20">{user.username} {me}</h2>
          <dl className="mt-2 flex flex-wrap text-sm leading-6 font-medium">
            <div className="absolute top-0 right-0 flex items-center space-x-1">
            <span className={`relative inline-flex rounded-full h-3 w-3 ${statusColor}`}></span>
            <span className="text-red">{user.isNewMessage? "New" : "" }</span>
            </div>     
         
            <div className="flex-none w-full font-normal">
            <dt className="sr-only">Last message</dt>
            <dd className="text-slate-400">last message</dd>
          </div>
           
          </dl>
        </div>
      </article>
    )
  }