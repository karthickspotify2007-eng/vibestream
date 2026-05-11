'use client';

import { useSyncExternalStore } from 'react';
import { songs as defaultSongs } from '@/data/songs';
import type { NewSongInput, PlayerState, RepeatMode, Song } from '@/types/music';

const CUSTOM_SONGS_KEY = 'vibestream.customSongs.v1';
const REMOVED_SONG_IDS_KEY = 'vibestream.removedSongIds.v1';
const CUSTOM_SONGS_EVENT = 'vibestream:custom-songs-changed';
export const AUDIO_LINK_ERROR_MESSAGE = 'This audio link cannot be played.';

type Listener = () => void;
type PlayerSnapshot = PlayerState & {
  currentTrack: Song | null;
  currentIndex: number;
};

const listeners = new Set<Listener>();

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const roundedSeconds = Math.floor(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const durationToSeconds = (duration: string) => {
  const parts = duration
    .split(':')
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
};

const sanitizeText = (value: string, fallback: string) => {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : fallback;
};

const normalizeSong = (song: Song): Song => ({
  id: sanitizeText(song.id, `song-${Date.now()}`),
  title: sanitizeText(song.title, 'Untitled Song'),
  artist: sanitizeText(song.artist, 'Unknown Artist'),
  album: sanitizeText(song.album, 'Single'),
  coverUrl: sanitizeText(song.coverUrl, ''),
  audioUrl: sanitizeText(song.audioUrl, ''),
  duration: sanitizeText(song.duration, '0:00'),
  genre: sanitizeText(song.genre, 'Other'),
  language: sanitizeText(song.language, 'Unknown'),
  year: Number.isFinite(song.year) ? Number(song.year) : new Date().getFullYear(),
});

const isSong = (value: unknown): value is Song => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.artist === 'string' &&
    typeof candidate.album === 'string' &&
    typeof candidate.coverUrl === 'string' &&
    typeof candidate.audioUrl === 'string' &&
    typeof candidate.duration === 'string' &&
    typeof candidate.genre === 'string' &&
    typeof candidate.language === 'string' &&
    typeof candidate.year === 'number'
  );
};

export const isExternalUrl = (value: string) => {
  try {
    const parsedUrl = new URL(value.trim());
    return ['http:', 'https:', 'blob:', 'data:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

export const isPlaceholderAudioUrl = (value: string) => {
  const normalizedValue = value.trim().toUpperCase();

  return (
    normalizedValue.length === 0 ||
    normalizedValue.includes('PASTE_MY_CLOUD_AUDIO_LINK_HERE') ||
    normalizedValue.includes('PASTE_CLOUD_MP3_LINK_HERE')
  );
};

export const readCustomSongs = (): Song[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawSongs = window.localStorage.getItem(CUSTOM_SONGS_KEY);

    if (!rawSongs) {
      return [];
    }

    const parsedSongs = JSON.parse(rawSongs) as unknown;

    if (!Array.isArray(parsedSongs)) {
      return [];
    }

    return parsedSongs.filter(isSong).map(normalizeSong);
  } catch {
    return [];
  }
};

export const readRemovedSongIds = (): Set<string> => {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const rawSongIds = window.localStorage.getItem(REMOVED_SONG_IDS_KEY);

    if (!rawSongIds) {
      return new Set();
    }

    const parsedSongIds = JSON.parse(rawSongIds) as unknown;

    if (!Array.isArray(parsedSongIds)) {
      return new Set();
    }

    return new Set(parsedSongIds.filter((songId): songId is string => typeof songId === 'string'));
  } catch {
    return new Set();
  }
};

const emitSongLibraryChanged = () => {
  window.dispatchEvent(new Event(CUSTOM_SONGS_EVENT));
};

const writeCustomSongs = (songsToSave: Song[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(songsToSave.map(normalizeSong)));
  emitSongLibraryChanged();
};

const writeRemovedSongIds = (songIds: Iterable<string>) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(REMOVED_SONG_IDS_KEY, JSON.stringify(Array.from(new Set(songIds))));
  emitSongLibraryChanged();
};

export const getMergedSongs = () => {
  const seenIds = new Set<string>();
  const removedSongIds = readRemovedSongIds();

  return [...defaultSongs, ...readCustomSongs()]
    .map(normalizeSong)
    .filter((song) => {
      if (removedSongIds.has(song.id)) {
        return false;
      }

      if (seenIds.has(song.id)) {
        return false;
      }

      seenIds.add(song.id);
      return true;
    });
};

export const addCustomSong = (input: NewSongInput) => {
  const year = Number(input.year);
  const newSong: Song = normalizeSong({
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    artist: input.artist,
    album: input.album,
    coverUrl: input.coverUrl,
    audioUrl: input.audioUrl,
    duration: input.duration?.trim() || '0:00',
    genre: input.genre,
    language: input.language,
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
  });

  writeCustomSongs([...readCustomSongs(), newSong]);
  playerActions.hydrateSongs();

  return newSong;
};

export const removeSong = (songId: string): 'custom' | 'default' | null => {
  const customSongs = readCustomSongs();
  const isCustomSong = customSongs.some((song) => song.id === songId);
  const isDefaultSong = defaultSongs.some((song) => song.id === songId);
  const wasCurrentTrack = state.currentTrackId === songId;

  if (isCustomSong) {
    writeCustomSongs(customSongs.filter((song) => song.id !== songId));
  } else if (isDefaultSong) {
    writeRemovedSongIds([...Array.from(readRemovedSongIds()), songId]);
  } else {
    return null;
  }

  playerActions.hydrateSongs();

  if (wasCurrentTrack) {
    const nextSong = state.songs[0] ?? null;
    setPlayerState({
      currentTrackId: nextSong?.id ?? null,
      isPlaying: false,
      isBuffering: false,
      currentTime: 0,
      duration: nextSong ? durationToSeconds(nextSong.duration) : 0,
      errorMessage: null,
      toastMessage: null,
    });
  }

  return isCustomSong ? 'custom' : 'default';
};

let state: PlayerState = {
  songs: defaultSongs,
  currentTrackId: defaultSongs[0]?.id ?? null,
  isPlaying: false,
  isBuffering: false,
  currentTime: 0,
  duration: durationToSeconds(defaultSongs[0]?.duration ?? '0:00'),
  volume: 0.72,
  isMuted: false,
  repeatMode: 'off',
  shuffle: false,
  errorMessage: null,
  toastMessage: null,
  playbackRequestId: 0,
};

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setPlayerState = (patch: Partial<PlayerState> | ((currentState: PlayerState) => Partial<PlayerState>)) => {
  const nextPatch = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...nextPatch };
  emit();
};

const getCurrentIndex = () => {
  return state.songs.findIndex((song) => song.id === state.currentTrackId);
};

const getCurrentTrack = () => {
  return state.songs.find((song) => song.id === state.currentTrackId) ?? null;
};

const getNextIndex = (direction: 1 | -1) => {
  if (state.songs.length === 0) {
    return -1;
  }

  const currentIndex = Math.max(getCurrentIndex(), 0);

  if (state.shuffle && state.songs.length > 1) {
    let randomIndex = currentIndex;

    while (randomIndex === currentIndex) {
      randomIndex = Math.floor(Math.random() * state.songs.length);
    }

    return randomIndex;
  }

  return (currentIndex + direction + state.songs.length) % state.songs.length;
};

let cachedState: PlayerState | null = null;
let cachedSnapshot: PlayerSnapshot | null = null;

const getSnapshot = (): PlayerSnapshot => {
  if (cachedSnapshot && cachedState === state) {
    return cachedSnapshot;
  }

  cachedState = state;
  cachedSnapshot = {
    ...state,
    currentTrack: getCurrentTrack(),
    currentIndex: getCurrentIndex(),
  };

  return cachedSnapshot;
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

let storageSyncStarted = false;

export const startSongStorageSync = () => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  playerActions.hydrateSongs();

  if (storageSyncStarted) {
    return () => undefined;
  }

  const handleSongsChanged = () => {
    playerActions.hydrateSongs();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CUSTOM_SONGS_KEY || event.key === REMOVED_SONG_IDS_KEY) {
      playerActions.hydrateSongs();
    }
  };

  window.addEventListener(CUSTOM_SONGS_EVENT, handleSongsChanged);
  window.addEventListener('storage', handleStorage);
  storageSyncStarted = true;

  return () => {
    window.removeEventListener(CUSTOM_SONGS_EVENT, handleSongsChanged);
    window.removeEventListener('storage', handleStorage);
    storageSyncStarted = false;
  };
};

export const playerActions = {
  hydrateSongs() {
    const mergedSongs = getMergedSongs();
    const currentTrackStillExists = mergedSongs.some((song) => song.id === state.currentTrackId);
    const nextTrack = currentTrackStillExists ? state.currentTrackId : mergedSongs[0]?.id ?? null;
    const nextSong = mergedSongs.find((song) => song.id === nextTrack) ?? null;

    setPlayerState({
      songs: mergedSongs,
      currentTrackId: nextTrack,
      duration: nextSong ? durationToSeconds(nextSong.duration) : 0,
    });
  },

  selectTrack(songId: string, shouldPlay = true) {
    const selectedSong = state.songs.find((song) => song.id === songId);

    if (!selectedSong) {
      return;
    }

    setPlayerState((currentState) => ({
      currentTrackId: songId,
      isPlaying: shouldPlay,
      isBuffering: shouldPlay,
      currentTime: 0,
      duration: durationToSeconds(selectedSong.duration),
      errorMessage: null,
      toastMessage: null,
      playbackRequestId: shouldPlay
        ? currentState.playbackRequestId + 1
        : currentState.playbackRequestId,
    }));
  },

  play() {
    if (!state.currentTrackId && state.songs[0]) {
      this.selectTrack(state.songs[0].id, true);
      return;
    }

    if (!state.currentTrackId) {
      setPlayerState({
        isPlaying: false,
        isBuffering: false,
      });
      return;
    }

    setPlayerState((currentState) => ({
      isPlaying: true,
      isBuffering: true,
      errorMessage: null,
      toastMessage: null,
      playbackRequestId: currentState.playbackRequestId + 1,
    }));
  },

  pause() {
    setPlayerState({
      isPlaying: false,
      isBuffering: false,
    });
  },

  togglePlay() {
    if (state.isPlaying) {
      this.pause();
      return;
    }

    this.play();
  },

  next(shouldPlay = true) {
    const nextIndex = getNextIndex(1);

    if (nextIndex < 0) {
      return;
    }

    this.selectTrack(state.songs[nextIndex].id, shouldPlay);
  },

  previous(shouldPlay = true) {
    const previousIndex = getNextIndex(-1);

    if (previousIndex < 0) {
      return;
    }

    this.selectTrack(state.songs[previousIndex].id, shouldPlay);
  },

  handleEnded() {
    if (state.repeatMode === 'one') {
      setPlayerState((currentState) => ({
        currentTime: 0,
        isPlaying: true,
        isBuffering: true,
        playbackRequestId: currentState.playbackRequestId + 1,
      }));
      return;
    }

    const currentIndex = getCurrentIndex();
    const shouldMoveForward = state.repeatMode === 'all' || state.shuffle || currentIndex < state.songs.length - 1;

    if (shouldMoveForward) {
      this.next(true);
      return;
    }

    setPlayerState({
      isPlaying: false,
      isBuffering: false,
      currentTime: 0,
    });
  },

  seek(time: number) {
    setPlayerState({
      currentTime: clamp(time, 0, Math.max(state.duration, time)),
    });
  },

  setDuration(duration: number) {
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    setPlayerState({ duration });
  },

  setCurrentTime(time: number) {
    if (!Number.isFinite(time)) {
      return;
    }

    setPlayerState({ currentTime: Math.max(0, time) });
  },

  setBuffering(isBuffering: boolean) {
    setPlayerState({ isBuffering });
  },

  setAudioReady() {
    setPlayerState({
      isBuffering: false,
      errorMessage: null,
    });
  },

  setAudioError(message = AUDIO_LINK_ERROR_MESSAGE) {
    setPlayerState({
      isPlaying: false,
      isBuffering: false,
      errorMessage: message,
      toastMessage: message,
    });
  },

  clearToast() {
    setPlayerState({ toastMessage: null });
  },

  setVolume(volume: number) {
    const nextVolume = clamp(volume, 0, 1);

    setPlayerState({
      volume: nextVolume,
      isMuted: nextVolume === 0,
    });
  },

  toggleMute() {
    setPlayerState((currentState) => ({
      isMuted: !currentState.isMuted,
    }));
  },

  cycleRepeatMode() {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];

    setPlayerState({ repeatMode: nextMode });
  },

  toggleShuffle() {
    setPlayerState((currentState) => ({
      shuffle: !currentState.shuffle,
    }));
  },
};

export const usePlayerStore = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
