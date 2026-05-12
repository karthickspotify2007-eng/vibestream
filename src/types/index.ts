export type RepeatMode = 'off' | 'one' | 'all';

export type Song = {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  durationSeconds?: number;
  genre: string;
  language: string;
  year: number;
  liked?: boolean;
  plays?: number;
  lyrics?: string;
  isLocal?: boolean;
};

export type LocalSong = {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  language: string;
  duration: string;
  durationSeconds: number;
  coverUrl: string;        // data URL or placeholder
  audioUrl: string;        // object URL — recreated each session from IDB blob
  fileName: string;
  fileSize: number;
  fileType: string;
  importedAt: string;
  isLocal: true;
  year: number;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
  year: number;
  genre: string;
  songs: Song[];
  description?: string;
  language?: string;
};

export type Artist = {
  id: string;
  name: string;
  imageUrl: string;
  bio?: string;
  genres?: string[];
  monthlyListeners?: number;
  songs?: Song[];
  albums?: Album[];
};

export type Playlist = {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  songs: Song[];
  userId?: string;
  isPublic?: boolean;
  createdAt?: string;
  songCount?: number;
};

export type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
};

export type PlayerState = {
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
  playbackRequestId: number;
  errorMessage: string | null;
};

export type LibraryState = {
  likedSongs: Song[];
  playlists: Playlist[];
  recentlyPlayed: Song[];
  localSongs: LocalSong[];
};

export type SearchResult = {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
};

export type Genre = {
  id: string;
  name: string;
  color: string;
  imageUrl: string;
};

export type ModalType = 'addToPlaylist' | 'createPlaylist' | null;
