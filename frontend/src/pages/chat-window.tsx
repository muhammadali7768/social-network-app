import ChatInput from "@/components/chat/ChatInput";
import ListItem from "@/components/chat/ContactItem";
import ContactList from "@/components/chat/ContactList";
import MessageList from "@/components/chat/MessageList";
import ChatWindowHeader from "@/components/layout/ChatWindowHeader";
import { useState } from "react";
import useUserStore from "@/hooks/useUserStore";
import useChatStore from "@/hooks/useChatStore";
import { IListUser } from "@/interfaces/auth.interfaces";

import MainChatItem from "@/components/chat/MainChatItem";

import { useChatEffects } from "@/hooks/useChatEffects";
export default function ChatWindow() {
  useChatEffects();
  const usersList = useUserStore((state) => state.usersList);

  const { mainChatMessages, activeChatMessages, setActiveChatMessages, setActiveChatIndex, activeChatIndex } =
    useChatStore();
  const user = useUserStore((state) => state.user);
  // const [activeIndex, setActiveIndex] = useState(0);

  //Here index is user id for Private messages and 0 for main chat
  const onChatChange = (index: number) => {
    setActiveChatIndex(index);
    if (index === 0) {
      setActiveChatMessages(mainChatMessages);
    } else if (index === user?.id) {
      //TODO: Enable sending messages to himeself
    } else {
      const activeChatUser = usersList.find((u) => u.id === index);
      console.log("Active User Chat", activeChatUser);
      setActiveChatMessages(activeChatUser?.messages || []);
    }
  };

  return (
    <main className={`flex min-h-screen flex-col items-center`}>
      <ChatWindowHeader />
      <div className="flex flex-col h-screen w-full gap-4 bg-slate-300 overflow-hidden">
        <div className="flex flex-row w-full h-screen bg-slate-100">
          {/* Contact List Starts */}
          <div className="basis-1/4 border  overflow-y-auto">
            <nav className="py-4 px-6 text-sm font-medium">
              <label>Contact List</label>
            </nav>
            <ContactList>
              <MainChatItem
                name="Main Chat"
                isActive={activeChatIndex === 0}
                onShow={() => onChatChange(0)}
              />
              {usersList &&
                usersList.map((user: IListUser) => {
                  return (
                    <ListItem
                      key={user.username}
                      user={user}
                      isActive={activeChatIndex === user.id}
                      onShow={() => onChatChange(user.id)}
                    />
                  );
                })}
            </ContactList>
          </div>{" "}
          {/* Contact List Ends */}
          <div className="basis-3/4 border">
            <div className="flex flex-col w-full h-screen bg-white">
              <div className="h-5/6">
                <MessageList key={activeChatIndex} messages={activeChatMessages} />
              </div>
              <div className="h-1/6 bg-slate-100 py-6">
                <ChatInput index={activeChatIndex} key={activeChatIndex} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
