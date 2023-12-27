// useUserStore.ts
import { create } from 'zustand';
import { IUser, IListUser } from '@/interfaces/auth.interfaces';
import { persist, createJSONStorage } from "zustand/middleware";
//type UserWithoutPassword = Pick<IUser, 'username' | 'email' | 'token'>;
interface UserStore {
  user: IListUser | null;
  usersList: IListUser[]
  setUser: (newUser: IListUser) => void;
  setUsersList: (newList: IListUser[])=> void;
  clearUserStore: ()=>void
}

const useUserStore = create<UserStore>()(
  persist<UserStore>((set) => ({
  user: null,
  usersList: [],
  setUser: (newUser) => {
    set({ user: newUser });
  },
  setUsersList: (newList: IListUser[])=>{
    set({usersList: newList})
  },
  clearUserStore: () => {set({ user: null })},
}),{
  name: 'social-app-user-storage',
  skipHydration: true,
}));

export default useUserStore;
