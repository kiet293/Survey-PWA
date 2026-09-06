// ─────────────────────────────────────────────
// Auth Store — Zustand
// ─────────────────────────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const VKU_DOMAIN = '@vku.udn.vn';

// Extract name from email prefix
function nameFromEmail(email: string): string {
  const prefix = email.split('@')[0];
  // e.g. "nguyen.van.a" → "Nguyen Van A"
  return prefix
    .split('.')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, _password: string) => {
        // Validate VKU email domain
        if (!email.endsWith(VKU_DOMAIN)) {
          return { success: false, error: 'Email phải có định dạng @vku.udn.vn' };
        }
        if (!email.trim() || email.length < 5) {
          return { success: false, error: 'Email không hợp lệ' };
        }

        // Mock authentication (no backend yet)
        // In production: call API here
        await new Promise((r) => setTimeout(r, 800)); // simulate network

        const user: User = {
          email,
          name: nameFromEmail(email),
        };

        set({ user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'vku-auth',
    }
  )
);
