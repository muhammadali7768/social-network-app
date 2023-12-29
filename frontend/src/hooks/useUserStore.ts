// useUserStore.ts
import { create } from "zustand";
import { IUser, IListUser } from "@/interfaces/auth.interfaces";
import { persist } from "zustand/middleware";
type UserWithoutPassword = Pick<IUser, "id" | "username" | "email" | "accessToken">;
interface UserStore {
  user: UserWithoutPassword | null;
  usersList: IListUser[];
  setUser: (newUser: UserWithoutPassword) => void;
  updateUserToken: (token: string) => void;
  setUsersList: (newList: IListUser[]) => void;
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
      updateUserToken: (token: string) => {
        const oldUser = get().user;
        if (oldUser?.email && oldUser?.id && oldUser.username) {
          set({
            user: {
              ...oldUser,
              accessToken: token,
            },
          });
        }
      },
      setUsersList: (newList: IListUser[]) => {
        set({ usersList: newList });
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
