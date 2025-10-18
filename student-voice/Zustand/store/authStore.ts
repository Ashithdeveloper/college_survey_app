import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the shape (type) of your user object
interface User {
  name: string;
  email: string;
  collegename: string;
  collegeId: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

// Define the entire store's state
interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
}

// ✅ Create the Zustand store with persist and AsyncStorage
const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }), 
      clearUser: () => set({ user: null, token: null }), //  Clears both user & token
    }),
    {
      name: "user-storage", // Storage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
