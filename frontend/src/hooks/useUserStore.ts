// useUserStore.ts
import { create } from 'zustand';
import { IUser, IListUser } from '@/interfaces/auth.interfaces';

type UserWithoutPassword = Pick<IUser, 'username' | 'email' | 'token'>;
interface UserStore {
  user: UserWithoutPassword | null;
  usersList: IListUser[]
  setUser: (newUser: UserWithoutPassword) => void;
  setUsersList: (newList: IListUser[])=> void;
  clearUserStore: ()=>void
}

const useUserStore = create<UserStore>(
  (set) => ({
  user: null,
  usersList: [],
  setUser: (newUser) => {
    set({ user: newUser });
  },
  setUsersList: (newList: IListUser[])=>{
    set({usersList: newList})
  },
  clearUserStore: () => {set({ user: null })},
}));

export default useUserStore;
