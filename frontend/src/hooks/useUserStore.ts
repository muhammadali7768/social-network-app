// useUserStore.ts
import { create } from 'zustand';
import { IUser } from '@/interfaces/auth.interfaces';

type UserWithoutPassword = Pick<IUser, 'username' | 'email' | 'token'>;
interface UserStore {
  user: UserWithoutPassword | null;
  setUser: (newUser: UserWithoutPassword) => void;
  clearUserStore: ()=>void
}

const useUserStore = create<UserStore>(
  (set) => ({
  user: null,
  setUser: (newUser) => {
    set({ user: newUser });
  },
  clearUserStore: () => {set({ user: null })},
}));

export default useUserStore;
