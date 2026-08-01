// src/stores/authStore.js
import { create } from 'zustand';

const useAuth = create((set) => ({
  user: null,
  login: async (email, password) => {
    console.log('Login attempt:', email);
    set({ user: { email, role: 'admin' } });  // Added missing closing } and )
    return true;
  },
  logout: () => set({ user: null })
}));

export default useAuth;
