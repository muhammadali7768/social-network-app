import Image from "next/image";
const movie={
    image: '/man.png',
    title: "Muhammad Ali",
    icon: "ok"
}
export default function ListItem() {
    return (
      <article className="flex items-start space-x-6 px-6 py-3 bg-white hover:bg-slate-50">
        <Image src={movie.image} alt="" width="60" height="60" className="flex-none w-14 h-14 rounded-md" />
        <div className="min-w-0 relative flex-auto">
          <h2 className="font-semibold text-slate-900 truncate pr-20">{movie.title}</h2>
          <dl className="mt-2 flex flex-wrap text-sm leading-6 font-medium">
            <div className="absolute top-0 right-0 flex items-center space-x-1">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
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