'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song, Playlist, LocalSong } from '@/types';
import { generateId } from '@/lib/utils';
import { saveFileToIDB, deleteFileFromIDB, getFileFromIDB } from '@/lib/indexeddb';

interface LibraryStore {
  likedSongs: Song[];
  playlists: Playlist[];
  recentlyPlayed: Song[];
  localSongs: LocalSong[];

  // ── Liked ─────────────────────────────────────
  toggleLike: (song: Song) => void;
  isLiked: (id: string) => boolean;

  // ── Recently played ───────────────────────────
  addRecentlyPlayed: (song: Song) => void;

  // ── Playlists ─────────────────────────────────
  createPlaylist: (title: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  updatePlaylist: (id: string, data: Partial<Playlist>) => void;
  renamePlaylist: (id: string, title: string) => void;
  isInPlaylist: (playlistId: string, songId: string) => boolean;

  // ── Local songs ───────────────────────────────
  addLocalSong: (song: LocalSong, file: File) => Promise<void>;
  removeLocalSong: (id: string) => Promise<void>;
  refreshLocalSongUrl: (id: string) => Promise<string | null>;
  clearLocalSongs: () => void;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      likedSongs: [],
      playlists: [],
      recentlyPlayed: [],
      localSongs: [],

      // ── Liked ──────────────────────────────────
      toggleLike: (song) => {
        const { likedSongs } = get();
        const exists = likedSongs.some((s) => s.id === song.id);
        set({
          likedSongs: exists
            ? likedSongs.filter((s) => s.id !== song.id)
            : [{ ...song, liked: true }, ...likedSongs],
        });
      },

      isLiked: (id) => get().likedSongs.some((s) => s.id === id),

      // ── Recently played ────────────────────────
      addRecentlyPlayed: (song) =>
        set((s) => ({
          recentlyPlayed: [song, ...s.recentlyPlayed.filter((r) => r.id !== song.id)].slice(0, 30),
        })),

      // ── Playlists ──────────────────────────────
      createPlaylist: (title, description = '') => {
        const playlist: Playlist = {
          id: generateId(),
          title,
          description,
          songs: [],
          createdAt: new Date().toISOString(),
          isPublic: false,
          coverUrl: '',
        };
        set((s) => ({ playlists: [...s.playlists, playlist] }));
        return playlist;
      },

      deletePlaylist: (id) =>
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),

      addToPlaylist: (playlistId, song) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId && !p.songs.some((ps) => ps.id === song.id)
              ? { ...p, songs: [...p.songs, song] }
              : p
          ),
        })),

      removeFromPlaylist: (playlistId, songId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, songs: p.songs.filter((ps) => ps.id !== songId) }
              : p
          ),
        })),

      updatePlaylist: (id, data) =>
        set((s) => ({
          playlists: s.playlists.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      renamePlaylist: (id, title) =>
        set((s) => ({
          playlists: s.playlists.map((p) => (p.id === id ? { ...p, title } : p)),
        })),

      isInPlaylist: (playlistId, songId) => {
        const pl = get().playlists.find((p) => p.id === playlistId);
        return pl ? pl.songs.some((s) => s.id === songId) : false;
      },

      // ── Local songs ────────────────────────────
      addLocalSong: async (song, file) => {
        await saveFileToIDB(song.id, file);
        set((s) => ({
          localSongs: [song, ...s.localSongs.filter((ls) => ls.id !== song.id)],
        }));
      },

      removeLocalSong: async (id) => {
        await deleteFileFromIDB(id);
        // Revoke object URL if it's still in memory
        const song = get().localSongs.find((s) => s.id === id);
        if (song?.audioUrl?.startsWith('blob:')) {
          try { URL.revokeObjectURL(song.audioUrl); } catch {}
        }
        set((s) => ({
          localSongs: s.localSongs.filter((ls) => ls.id !== id),
        }));
      },

      refreshLocalSongUrl: async (id) => {
        const file = await getFileFromIDB(id);
        if (!file) return null;
        const url = URL.createObjectURL(file);
        set((s) => ({
          localSongs: s.localSongs.map((ls) =>
            ls.id === id ? { ...ls, audioUrl: url } : ls
          ),
        }));
        return url;
      },

      clearLocalSongs: () => set({ localSongs: [] }),
    }),
    {
      name: 'vibestream-library',
      partialize: (state) => ({
        likedSongs: state.likedSongs,
        playlists: state.playlists,
        recentlyPlayed: state.recentlyPlayed,
        // store metadata but audioUrl will be re-hydrated from IDB
        localSongs: state.localSongs.map((s) => ({ ...s, audioUrl: '' })),
      }),
    }
  )
);
