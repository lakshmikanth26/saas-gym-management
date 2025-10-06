import { create } from 'zustand'

export const useGymStore = create((set) => ({
  gym: null,
  setGym: (gym) => set({ gym }),
  clearGym: () => set({ gym: null }),
}))

