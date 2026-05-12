'use client';

import { create } from 'zustand';
import type { Toast, ModalType, Song } from '@/types';
import { generateId } from '@/lib/utils';

interface UIStore {
  // ── Toasts ───────────────────────────────────
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;

  // ── Modals ───────────────────────────────────
  modal: ModalType;
  modalSong: Song | null;   // song to add when opening addToPlaylist modal
  openAddToPlaylist: (song: Song) => void;
  openCreatePlaylist: (song?: Song) => void;
  openUploadSong: () => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>()((set, get) => ({
  toasts: [],

  addToast: (message, type = 'success') => {
    const id = generateId();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    // Auto-remove after 3 s
    setTimeout(() => get().removeToast(id), 3000);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  modal: null,
  modalSong: null,

  openAddToPlaylist: (song) => set({ modal: 'addToPlaylist', modalSong: song }),
  openCreatePlaylist: (song) => set({ modal: 'createPlaylist', modalSong: song ?? null }),
  openUploadSong: () => set({ modal: 'uploadSong', modalSong: null }),
  closeModal: () => set({ modal: null, modalSong: null }),
}));
