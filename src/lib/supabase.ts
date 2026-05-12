import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = url && key ? createClient(url, key) : null;

const isConfigured = () => !!supabase;

// ── Songs ──────────────────────────────────────────────────
export async function fetchSongs() {
  if (!isConfigured()) return [];
  const { data } = await supabase!
    .from('songs')
    .select('*, artists(name, image_url), albums(title, cover_url)')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function fetchSongById(id: string) {
  if (!isConfigured()) return null;
  const { data } = await supabase!
    .from('songs')
    .select('*, artists(name, image_url), albums(title, cover_url)')
    .eq('id', id)
    .single();
  return data;
}

export async function insertSong(song: {
  title: string; artist_id?: string; album_id?: string;
  audio_url: string; cover_url: string; duration: string;
  genre: string; language?: string; year?: number;
}) {
  if (!isConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase!.from('songs').insert(song).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSong(id: string) {
  if (!isConfigured()) throw new Error('Supabase not configured');
  const { error } = await supabase!.from('songs').delete().eq('id', id);
  if (error) throw error;
}

// ── Artists ────────────────────────────────────────────────
export async function fetchArtists() {
  if (!isConfigured()) return [];
  const { data } = await supabase!.from('artists').select('*').order('name');
  return data ?? [];
}

export async function fetchArtistById(id: string) {
  if (!isConfigured()) return null;
  const { data } = await supabase!
    .from('artists')
    .select('*, songs(*, albums(title, cover_url))')
    .eq('id', id)
    .single();
  return data;
}

// ── Albums ─────────────────────────────────────────────────
export async function fetchAlbums() {
  if (!isConfigured()) return [];
  const { data } = await supabase!
    .from('albums')
    .select('*, artists(name, image_url), songs(*)')
    .order('year', { ascending: false });
  return data ?? [];
}

export async function fetchAlbumById(id: string) {
  if (!isConfigured()) return null;
  const { data } = await supabase!
    .from('albums')
    .select('*, artists(name, image_url), songs(*)')
    .eq('id', id)
    .single();
  return data;
}

// ── Storage ────────────────────────────────────────────────
export async function uploadFile(bucket: string, path: string, file: File) {
  if (!isConfigured()) throw new Error('Supabase not configured');
  const { data, error } = await supabase!.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase!.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

// ── Search ─────────────────────────────────────────────────
export async function searchAll(query: string) {
  if (!isConfigured() || !query.trim()) return { songs: [], artists: [], albums: [] };
  const q = `%${query.toLowerCase()}%`;

  const [songsRes, artistsRes, albumsRes] = await Promise.all([
    supabase!.from('songs').select('*, artists(name)').ilike('title', q).limit(10),
    supabase!.from('artists').select('*').ilike('name', q).limit(6),
    supabase!.from('albums').select('*, artists(name)').ilike('title', q).limit(6),
  ]);

  return {
    songs:   songsRes.data   ?? [],
    artists: artistsRes.data ?? [],
    albums:  albumsRes.data  ?? [],
  };
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SUPABASE SQL SCHEMA  (run in Supabase SQL editor)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Artists
create table artists (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  image_url  text,
  bio        text,
  genres     text[],
  created_at timestamptz default now()
);

-- Albums
create table albums (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  artist_id  uuid references artists(id) on delete cascade,
  cover_url  text,
  year       int,
  genre      text,
  language   text,
  description text,
  created_at timestamptz default now()
);

-- Songs
create table songs (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  artist_id  uuid references artists(id),
  album_id   uuid references albums(id),
  audio_url  text not null,
  cover_url  text,
  duration   text,
  genre      text,
  language   text,
  year       int,
  plays      bigint default 0,
  lyrics     text,
  created_at timestamptz default now()
);

-- Playlists
create table playlists (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text,
  name        text not null,
  description text,
  cover_url   text,
  is_public   boolean default false,
  created_at  timestamptz default now()
);

-- Playlist songs (supports both online + local songs)
create table playlist_songs (
  id             uuid primary key default uuid_generate_v4(),
  playlist_id    uuid references playlists(id) on delete cascade,
  song_id        uuid references songs(id),
  local_song_id  text,
  position       int,
  added_at       timestamptz default now()
);

-- User liked songs
create table user_liked_songs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    text not null,
  song_id    uuid references songs(id) on delete cascade,
  liked_at   timestamptz default now(),
  unique(user_id, song_id)
);

-- Recently played
create table recently_played (
  id         uuid primary key default uuid_generate_v4(),
  user_id    text not null,
  song_id    uuid references songs(id),
  played_at  timestamptz default now()
);

-- Storage buckets (run in Supabase dashboard > Storage)
-- Bucket: "audio"   (public)
-- Bucket: "covers"  (public)
*/
