'use client';

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { Song, RepeatMode } from '@/types';
import { shuffleArray, durationToSeconds } from '@/lib/utils';

interface PlayerStore {
  currentSong: Song | null;
  queue: Song[];
  history: Song[];
  queueIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  showQueue: boolean;
  showFullscreen: boolean;
  showMiniPlayer: boolean;
  playbackRequestId: number;
  errorMessage: string | null;

  playSong: (song: Song, queue?: Song[]) => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setBuffering: (b: boolean) => void;
  setPlaying: (p: boolean) => void;
  setError: (msg: string | null) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  jumpTo: (index: number) => void;
  toggleQueue: () => void;
  toggleFullscreen: () => void;
  handleEnded: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        currentSong: null,
        queue: [],
        history: [],
        queueIndex: -1,
        isPlaying: false,
        isBuffering: false,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        isMuted: false,
        repeatMode: 'off',
        shuffle: false,
        showQueue: false,
        showFullscreen: false,
        showMiniPlayer: true,
        playbackRequestId: 0,
        errorMessage: null,

        playSong: (song, queue) => {
          const q = queue ?? [song];
          const idx = q.findIndex((s) => s.id === song.id);
          set((s) => ({
            currentSong: song,
            queue: q,
            queueIndex: idx >= 0 ? idx : 0,
            isPlaying: true,
            isBuffering: true,
            currentTime: 0,
            duration: durationToSeconds(song.duration),
            errorMessage: null,
            playbackRequestId: s.playbackRequestId + 1,
            history: s.currentSong
              ? [s.currentSong, ...s.history.slice(0, 49)]
              : s.history,
          }));
        },

        playQueue: (songs, startIndex = 0) => {
          const song = songs[startIndex];
          if (!song) return;
          set((s) => ({
            currentSong: song,
            queue: songs,
            queueIndex: startIndex,
            isPlaying: true,
            isBuffering: true,
            currentTime: 0,
            duration: durationToSeconds(song.duration),
            errorMessage: null,
            playbackRequestId: s.playbackRequestId + 1,
          }));
        },

        togglePlay: () => {
          const { isPlaying, currentSong, queue } = get();
          if (!currentSong && queue.length > 0) {
            get().playQueue(queue, 0);
            return;
          }
          set((s) => ({
            isPlaying: !isPlaying,
            playbackRequestId: !isPlaying ? s.playbackRequestId + 1 : s.playbackRequestId,
          }));
        },

        play: () => set((s) => ({
          isPlaying: true,
          playbackRequestId: s.playbackRequestId + 1,
        })),

        pause: () => set({ isPlaying: false, isBuffering: false }),

        next: () => {
          const { queue, queueIndex, shuffle, repeatMode } = get();
          if (queue.length === 0) return;

          if (repeatMode === 'one') {
            set((s) => ({
              currentTime: 0,
              isPlaying: true,
              isBuffering: true,
              playbackRequestId: s.playbackRequestId + 1,
            }));
            return;
          }

          let nextIdx: number;
          if (shuffle) {
            let r = queueIndex;
            while (r === queueIndex && queue.length > 1) {
              r = Math.floor(Math.random() * queue.length);
            }
            nextIdx = r;
          } else {
            nextIdx = queueIndex + 1;
          }

          if (nextIdx >= queue.length) {
            if (repeatMode === 'all') nextIdx = 0;
            else {
              set({ isPlaying: false, isBuffering: false, currentTime: 0 });
              return;
            }
          }

          const song = queue[nextIdx];
          set((s) => ({
            currentSong: song,
            queueIndex: nextIdx,
            isPlaying: true,
            isBuffering: true,
            currentTime: 0,
            duration: durationToSeconds(song.duration),
            errorMessage: null,
            playbackRequestId: s.playbackRequestId + 1,
            history: s.currentSong
              ? [s.currentSong, ...s.history.slice(0, 49)]
              : s.history,
          }));
        },

        previous: () => {
          const { queue, queueIndex, currentTime } = get();
          if (currentTime > 3) {
            set((s) => ({
              currentTime: 0,
              playbackRequestId: s.playbackRequestId + 1,
            }));
            return;
          }
          const prevIdx = Math.max(0, queueIndex - 1);
          const song = queue[prevIdx];
          if (!song) return;
          set((s) => ({
            currentSong: song,
            queueIndex: prevIdx,
            isPlaying: true,
            isBuffering: true,
            currentTime: 0,
            duration: durationToSeconds(song.duration),
            errorMessage: null,
            playbackRequestId: s.playbackRequestId + 1,
          }));
        },

        seek: (time) => set({ currentTime: Math.max(0, time) }),

        setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)), isMuted: v === 0 }),

        toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

        toggleShuffle: () => {
          const { shuffle, queue, queueIndex } = get();
          if (!shuffle && queue.length > 0) {
            const current = queue[queueIndex];
            const rest = queue.filter((_, i) => i !== queueIndex);
            const shuffled = shuffleArray(rest);
            const newQueue = current ? [current, ...shuffled] : shuffled;
            set({ shuffle: true, queue: newQueue, queueIndex: 0 });
          } else {
            set({ shuffle: false });
          }
        },

        cycleRepeat: () => {
          const modes: RepeatMode[] = ['off', 'all', 'one'];
          const { repeatMode } = get();
          const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
          set({ repeatMode: next });
        },

        setCurrentTime: (t) => set({ currentTime: t }),
        setDuration: (d) => set({ duration: d }),
        setBuffering: (b) => set({ isBuffering: b }),
        setPlaying: (p) => set({ isPlaying: p }),
        setError: (msg) => set({ errorMessage: msg, isPlaying: false, isBuffering: false }),

        addToQueue: (song) => set((s) => ({ queue: [...s.queue, song] })),

        removeFromQueue: (index) =>
          set((s) => {
            const q = s.queue.filter((_, i) => i !== index);
            const newIdx = index <= s.queueIndex
              ? Math.max(0, s.queueIndex - 1)
              : s.queueIndex;
            return { queue: q, queueIndex: newIdx };
          }),

        clearQueue: () => set({ queue: [], queueIndex: -1, currentSong: null, isPlaying: false }),

        jumpTo: (index) => {
          const { queue } = get();
          const song = queue[index];
          if (!song) return;
          set((s) => ({
            currentSong: song,
            queueIndex: index,
            isPlaying: true,
            isBuffering: true,
            currentTime: 0,
            duration: durationToSeconds(song.duration),
            errorMessage: null,
            playbackRequestId: s.playbackRequestId + 1,
          }));
        },

        toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),
        toggleFullscreen: () => set((s) => ({ showFullscreen: !s.showFullscreen })),

        handleEnded: () => {
          const { repeatMode } = get();
          if (repeatMode === 'one') {
            set((s) => ({
              currentTime: 0,
              isPlaying: true,
              isBuffering: true,
              playbackRequestId: s.playbackRequestId + 1,
            }));
          } else {
            get().next();
          }
        },
      }),
      {
        name: 'vibestream-player',
        partialize: (s) => ({
          volume: s.volume,
          isMuted: s.isMuted,
          repeatMode: s.repeatMode,
          shuffle: s.shuffle,
          queue: s.queue,
          queueIndex: s.queueIndex,
          currentSong: s.currentSong,
        }),
      }
    )
  )
);
