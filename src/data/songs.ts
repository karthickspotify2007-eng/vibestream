import type { Song } from '@/types/music';

export const songs: Song[] = [
  {
    id: 'song-001',
    title: 'Midnight Dreams',
    artist: 'Aarav Beats',
    album: 'Neon Nights',
    coverUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12',
    genre: 'Chill',
    language: 'English',
    year: 2026,
  },
  {
    id: 'song-002',
    title: 'Glass City Pulse',
    artist: 'Mira Vale',
    album: 'Afterhours Atlas',
    coverUrl:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '5:23',
    genre: 'Electronic',
    language: 'English',
    year: 2025,
  },
  {
    id: 'song-003',
    title: 'Golden Monsoon',
    artist: 'Kiran Flow',
    album: 'Rainlight',
    coverUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:44',
    genre: 'Fusion',
    language: 'Hindi',
    year: 2024,
  },
  {
    id: 'song-004',
    title: 'Late Train Loops',
    artist: 'Noor Static',
    album: 'Terminal Glow',
    coverUrl:
      'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=900&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: '6:00',
    genre: 'Lo-Fi',
    language: 'Instrumental',
    year: 2026,
  },
];

export default songs;
