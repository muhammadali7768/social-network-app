import { create } from "zustand";
import { IMessage } from "@/interfaces/message.interface";

interface ChatStore {
  mainChatMessages: IMessage[];
  activeChatIndex: number;
  activeChatMessages: IMessage[];
  setMainChatMessages: (newMessages: IMessage[]) => void;
  updateMainChatMessages: (newMessage: IMessage) => void;
  updateActiveChatMessages: (newMessage: IMessage) => void;
  updateMainMessage: (id: number, messageClientId: number) => void;
  setActiveChatIndex: (index: number) => void;
  setActiveChatMessages: (newMessages: IMessage[]) => void;
  clearChatStore: () => void;
}

const useChatStore = create<ChatStore>()((set, get) => ({
  mainChatMessages: [],
  activeChatMessages: [],
  activeChatIndex: 0,
  setMainChatMessages: (newList: IMessage[]) => {
    set({ mainChatMessages: newList });
  },
  updateMainChatMessages: (newMessage: IMessage) => {
    set({ mainChatMessages: [...get().mainChatMessages, newMessage] });
  },
  updateActiveChatMessages: (newMessage: IMessage) => {
    set({ activeChatMessages: [...get().activeChatMessages, newMessage] });
  },
  setActiveChatMessages: (newList: IMessage[]) => {
    console.log("Setting Active chat Messages")
    set({ activeChatMessages: newList });
  },
  updateMainMessage: async(id: number, messageClientId: number) => {   
    const updatedMessages=get().mainChatMessages.map((msg) => {
      if (msg.messageClientId === messageClientId) {
        return { ...msg, id };
      } else return msg;
    });

    
    set({
      mainChatMessages: updatedMessages,
    });
    console.log("Message ID",get().mainChatMessages)
  },
  setActiveChatIndex: (index: number) => {
    set({ activeChatIndex: index });
  },
  clearChatStore: () => {
    set({ mainChatMessages: [], activeChatMessages: [] });
  },
}));

export default useChatStore;
