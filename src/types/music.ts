export type AudioMimeHint = 'mp3' | 'wav' | 'ogg' | 'cloud' | 'artifact';

export type RepeatMode = 'off' | 'one' | 'all';

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  genre: string;
  language: string;
  year: number;
};

export type NewSongInput = {
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration?: string;
  genre: string;
  language: string;
  year: number;
};

export type PlayerState = {
  songs: Song[];
  currentTrackId: string | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  errorMessage: string | null;
  toastMessage: string | null;
  playbackRequestId: number;
};
