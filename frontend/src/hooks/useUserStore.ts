// useUserStore.ts
import { create } from "zustand";
import { IUser, IListUser } from "@/interfaces/auth.interfaces";
import { persist } from "zustand/middleware";
import { IMessage } from "@/interfaces/message.interface";
type UserWithoutPassword = Pick<
  IUser,
  "id" | "username" | "email" | "accessToken" | "refreshToken"
>;
interface UserStore {
  user: UserWithoutPassword | null;
  usersList: IListUser[];
  setUser: (newUser: UserWithoutPassword) => void;
  updateUserTokens: (token: string, refToken:string) => void;
  setUsersList: (newList: IListUser[]) => void;
  updateUserMessages:(userId:number, newMessage:IMessage)=>void
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
      updateUserTokens: (accessToken: string, refreshToken:string) => {
        const oldUser = get().user;
        if (oldUser?.email && oldUser?.id && oldUser.username) {
          set({
            user: {
              ...oldUser,
              accessToken: accessToken,
              refreshToken: refreshToken
            },
          });
        }
      },
      setUsersList: (newList: IListUser[]) => {
        set({
          usersList: newList.map((u) => {
            //TODO: assign latest 10 messages to user in the backend and remove this u.messages
            u.messages=[] 
            return u;
          }),
        });
      },
      updateUserMessages:(userId, newMessage:IMessage)=>{
        set({
          usersList: get().usersList.map((u)=>{
            if(u.id===userId) {
             u.messages=[...u.messages,newMessage];
             u.isNewMessage= true;
             return u
            }
            else return u;
          })
        })
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
