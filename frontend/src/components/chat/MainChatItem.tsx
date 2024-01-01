import Image from "next/image"
export default function MainChatItem({name, isActive, onShow} : {name:string, isActive:boolean, onShow: ()=> void}) {
    const activeColor=isActive? "bg-slate-50" : "bg-white"
 //TODO: show a group image of different users 
    return (
      <article onClick={onShow} className={`flex items-center space-x-6 px-6 py-3 ${activeColor} hover:bg-slate-50`}>
         <Image src="/man.png" alt="" width="60" height="60" className="flex-none w-14 h-14 rounded-md" />
        <div className="min-w-0 relative flex-auto">
          <h2 className="font-semibold text-slate-900 truncate pr-20">{name}</h2>
          <dl className="mt-2 flex flex-wrap text-sm leading-6 font-medium">
            <div className="absolute top-0 right-0 flex items-center space-x-1">
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