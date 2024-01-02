import { create } from "zustand";

import { IMessage } from "@/interfaces/message.interface";

interface ChatStore {
  mainChatMessages: IMessage[];
  activeChatMessages: IMessage[]
  setMainChatMessages: (newMessages: IMessage[]) => void;
  updateMainChatMessages:(newMessage:IMessage)=>void;
  updateActiveChatMessages:(newMessage:IMessage)=>void
  setActiveChatMessages: (newMessages: IMessage[]) => void;
  clearChatStore: () => void;
}

const useChatStore = create<ChatStore>()((set, get) => ({
  mainChatMessages: [],
  activeChatMessages: [],
  setMainChatMessages: (newList: IMessage[]) => {
    set({ mainChatMessages: newList });
  },
  updateMainChatMessages:(newMessage:IMessage)=>{
    set({mainChatMessages: [...get().mainChatMessages, newMessage] })
  },
  updateActiveChatMessages:(newMessage:IMessage)=>{
    set({activeChatMessages: [...get().activeChatMessages, newMessage] })
  },
  setActiveChatMessages: (newList: IMessage[]) => {
    set({ activeChatMessages: newList });
  },
  clearChatStore: () => {
    set({ mainChatMessages: [], activeChatMessages: [] });
  },
}));

export default useChatStore;
