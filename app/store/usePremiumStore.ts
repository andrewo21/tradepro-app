import { create } from "zustand";

interface PremiumState {
  isPremium: boolean;
  unlockPremium: () => void;
}

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: true,
  unlockPremium: () => set({ isPremium: true }),
}));
