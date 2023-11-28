// useUserStore.ts
import { create } from 'zustand';
import { IUser } from '@/interfaces/auth.interfaces';

type UserWithoutPassword = Pick<IUser, 'username' | 'email' | 'token'>;
type ListUser=Pick<IUser, 'id'| 'username'| 'email'>
interface UserStore {
  user: UserWithoutPassword | null;
  usersList: ListUser[]
  setUser: (newUser: UserWithoutPassword) => void;
  setUsersList: (newList: ListUser[])=> void;
  clearUserStore: ()=>void
}

const useUserStore = create<UserStore>(
  (set) => ({
  user: null,
  usersList: [],
  setUser: (newUser) => {
    set({ user: newUser });
  },
  setUsersList: (newList: ListUser[])=>{
    set({usersList: newList})
  },
  clearUserStore: () => {set({ user: null })},
}));

export default useUserStore;
