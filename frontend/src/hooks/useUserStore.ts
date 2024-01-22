// useUserStore.ts
import { create } from "zustand";
import { IUser, IListUser } from "@/interfaces/auth.interfaces";
import { persist } from "zustand/middleware";
import { IMessage } from "@/interfaces/message.interface";
import { produce } from "immer";

type UserWithoutPassword = Pick<
  IUser,
  "id" | "username" | "email" | "accessToken" | "refreshToken"
>;
interface UserStore {
  user: UserWithoutPassword | null;
  usersList: IListUser[];
  setUser: (newUser: UserWithoutPassword) => void;
  setUsersList: (newList: IListUser[]) => void;
  updateUserMessages: (userId: number, newMessage: IMessage) => void;
  updateMessage: (
    id: number,
    messageClientId: number,
    receipientId: number
  ) => void;
  clearUserStore: () => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      usersList: [],
      setUser: (newUser) => {
        set({ user: newUser });
      },

      setUsersList: (newList: IListUser[]) => {
        set({
          usersList: newList.map((u) => {
            //TODO: assign latest 10 messages to user in the backend and remove this u.messages
            u.messages = [];
            return u;
          }),
        });
      },

      //TODO: Convert it to immer middleware, currently getting proxy issue using immer
      updateMessage: (
        id: number,
        messageClientId: number,
        recipientId: number
      ): void => {
        const indexToBeUpdated = get().usersList.findIndex(
          (u) => u.id === recipientId
        );
        if (indexToBeUpdated > -1) {
          console.log("store recipientId", recipientId);
          const updatedMessages = get().usersList[
            indexToBeUpdated
          ].messages.map((msg) => {
            if (msg.messageClientId === messageClientId) return { ...msg, id };
            else return msg;
          });
          const newUsersList = [...get().usersList];
          newUsersList[indexToBeUpdated].messages = updatedMessages;
          set({ usersList: newUsersList });
        }
      },
      updateUserMessages: (userId, newMessage: IMessage) => {
        set({
          usersList: get().usersList.map((u) => {
            if (u.id === userId) {
              u.messages = [...u.messages, newMessage];
              u.isNewMessage = true;
              return u;
            } else return u;
          }),
        });
      },
      clearUserStore: () => {
        set({ user: null });
      },
    }),
    {
      name: "social-app-user-storage",
      partialize: (state) => ({ user: state.user }),
      // skipHydration: true,
    }
  )
);

export default useUserStore;
