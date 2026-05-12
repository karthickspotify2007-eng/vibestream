'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song, Playlist } from '@/types';
import { generateId } from '@/lib/utils';

interface LibraryStore {
  likedSongs: Song[];
  playlists: Playlist[];
  recentlyPlayed: Song[];

  toggleLike: (song: Song) => void;
  isLiked: (id: string) => boolean;
  addRecentlyPlayed: (song: Song) => void;
  createPlaylist: (title: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  updatePlaylist: (id: string, data: Partial<Playlist>) => void;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      likedSongs: [],
      playlists: [],
      recentlyPlayed: [],

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

      addRecentlyPlayed: (song) =>
        set((s) => ({
          recentlyPlayed: [
            song,
            ...s.recentlyPlayed.filter((r) => r.id !== song.id),
          ].slice(0, 30),
        })),

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
            p.id === playlistId && !p.songs.some((s) => s.id === song.id)
              ? { ...p, songs: [...p.songs, song] }
              : p
          ),
        })),

      removeFromPlaylist: (playlistId, songId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, songs: p.songs.filter((s) => s.id !== songId) }
              : p
          ),
        })),

      updatePlaylist: (id, data) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
    }),
    { name: 'vibestream-library' }
  )
);
