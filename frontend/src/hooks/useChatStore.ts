import { create } from "zustand";
import {devtools} from 'zustand/middleware'
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

const useChatStore = create<ChatStore>()(devtools((set, get) => ({
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
    set({ activeChatMessages: newList });
  },
  updateMainMessage: (id: number, messageClientId: number) => {
    const messageIndex = get().mainChatMessages.findIndex(
      (msg) => msg.messageClientId === messageClientId
    );
    if (messageIndex != -1) {
      const updatedMessage = { ...get().mainChatMessages[messageIndex], id };
        const updatedMessages = [...get().mainChatMessages];
        updatedMessages[messageIndex] = updatedMessage;
     set({mainChatMessages: updatedMessages})
    }
  },
  setActiveChatIndex: (index: number) => {
    set({ activeChatIndex: index });
  },
  clearChatStore: () => {
    set({ mainChatMessages: [], activeChatMessages: [] });
  },
})));

export default useChatStore;
