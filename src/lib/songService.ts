/**
 * songService.ts
 * High-level service layer that bridges the Supabase DB with the app's Song type.
 * All functions fall back gracefully when Supabase is not configured.
 */

import {
  fetchSongs,
  fetchSongById,
  insertSong,
  deleteSong,
  searchAll,
  likeSong,
  unlikeSong,
  fetchLikedSongs,
  addRecentlyPlayedDB,
  fetchRecentlyPlayed,
  upsertArtist,
  upsertAlbum,
  dbSongToSong,
  isSupabaseConfigured,
  type InsertSong,
} from './supabase';
import { uploadSongFile, getAudioDuration } from './uploadSong';
import { uploadCoverFile } from './uploadCover';
import type { Song } from '@/types';

// ── Local anonymous user ID ───────────────────────────────────────────────────
const ANON_USER_ID = 'vibestream-anon';

// ── getSongs ──────────────────────────────────────────────────────────────────
/**
 * Fetches all songs from Supabase, mapped to the app Song type.
 * Returns an empty array when not configured.
 */
export async function getSongs(): Promise<Song[]> {
  const rows = await fetchSongs();
  return rows.map(dbSongToSong);
}

// ── getSongById ───────────────────────────────────────────────────────────────
export async function getSongById(id: string): Promise<Song | null> {
  const row = await fetchSongById(id);
  return row ? dbSongToSong(row) : null;
}

// ── searchSongs ───────────────────────────────────────────────────────────────
/**
 * Full-text search across songs, artists, and albums.
 * Returns a unified { songs, artists, albums } object.
 */
export async function searchSongs(query: string) {
  if (!isSupabaseConfigured()) return { songs: [], artists: [], albums: [] };
  const results = await searchAll(query);
  return {
    songs: results.songs.map(dbSongToSong),
    artists: results.artists,
    albums: results.albums,
  };
}

// ── addSong ───────────────────────────────────────────────────────────────────
/**
 * Full upload flow:
 *  1. Upload audio to storage
 *  2. Upload cover to storage (if provided)
 *  3. Upsert artist in DB
 *  4. Upsert album in DB (if provided)
 *  5. Insert song row in DB
 * Returns the new Song.
 */
export async function addSong(params: {
  title: string;
  artistName: string;
  albumName?: string;
  genre?: string;
  language?: string;
  year?: number;
  audioFile: File;
  coverFile?: File | null;
}): Promise<Song> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { title, artistName, albumName, genre, language, year, audioFile, coverFile } = params;

  // Upload files in parallel
  const [audioResult, coverResult, duration] = await Promise.all([
    uploadSongFile(audioFile),
    coverFile ? uploadCoverFile(coverFile) : Promise.resolve(null),
    getAudioDuration(audioFile),
  ]);

  const coverUrl = coverResult?.coverUrl ?? null;

  // Upsert artist
  const artistId = await upsertArtist(artistName, coverUrl ?? undefined);

  // Upsert album (if provided)
  let albumId: string | null = null;
  if (albumName?.trim()) {
    albumId = await upsertAlbum(albumName, artistId, coverUrl ?? undefined, year, genre, language);
  }

  const songRow: InsertSong = {
    title,
    artist_id: artistId,
    album_id: albumId,
    audio_url: audioResult.audioUrl,
    cover_url: coverUrl,
    duration,
    genre: genre ?? null,
    language: language ?? null,
    year: year ?? null,
  };

  const inserted = await insertSong(songRow);
  return dbSongToSong(inserted);
}

// ── deleteSong ────────────────────────────────────────────────────────────────
export async function removeSong(id: string): Promise<void> {
  await deleteSong(id);
}

// ── likeSong / unlikeSong ─────────────────────────────────────────────────────
export async function toggleSongLike(songId: string, isLiked: boolean): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (isLiked) {
    await unlikeSong(ANON_USER_ID, songId);
  } else {
    await likeSong(ANON_USER_ID, songId);
  }
}

export async function getLikedSongs(): Promise<Song[]> {
  const rows = await fetchLikedSongs(ANON_USER_ID);
  return rows.map(dbSongToSong);
}

// ── Recently Played ───────────────────────────────────────────────────────────
export async function addRecentlyPlayed(songId: string): Promise<void> {
  await addRecentlyPlayedDB(ANON_USER_ID, songId);
}

export async function getRecentlyPlayed(): Promise<Song[]> {
  const rows = await fetchRecentlyPlayed(ANON_USER_ID);
  return rows.map(dbSongToSong);
}
