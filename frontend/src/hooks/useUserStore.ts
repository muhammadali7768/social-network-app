// useUserStore.ts
import { create } from 'zustand';
import { IUser } from '@/interfaces/auth.interfaces';

type UserWithoutPassword = Pick<IUser, 'username' | 'email' | 'token'>;
interface UserStore {
  user: UserWithoutPassword | {};
  setUser: (newUser: UserWithoutPassword) => void;
}

const useUserStore = create<UserStore>(
  (set) => ({
  user: {},
  setUser: (newUser) => {
    set({ user: newUser });
  },
}));

export default useUserStore;
