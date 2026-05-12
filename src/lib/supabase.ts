import { createClient } from '@supabase/supabase-js';

// ── Types that match our DB schema ────────────────────────────────────────────

export type DbSong = {
  id: string;
  title: string;
  artist_id: string | null;
  album_id: string | null;
  audio_url: string;
  cover_url: string | null;
  duration: string | null;
  genre: string | null;
  language: string | null;
  year: number | null;
  plays: number;
  lyrics: string | null;
  created_at: string;
  // joined
  artists?: { id: string; name: string; image_url: string | null } | null;
  albums?: { id: string; title: string; cover_url: string | null } | null;
};

export type DbArtist = {
  id: string;
  name: string;
  image_url: string | null;
  bio: string | null;
  genres: string[] | null;
  created_at: string;
};

export type DbAlbum = {
  id: string;
  title: string;
  artist_id: string | null;
  cover_url: string | null;
  year: number | null;
  genre: string | null;
  language: string | null;
  description: string | null;
  created_at: string;
  artists?: { id: string; name: string; image_url: string | null } | null;
};

export type DbPlaylist = {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  created_at: string;
};

export type InsertSong = {
  title: string;
  artist_id?: string | null;
  album_id?: string | null;
  audio_url: string;
  cover_url?: string | null;
  duration?: string | null;
  genre?: string | null;
  language?: string | null;
  year?: number | null;
  lyrics?: string | null;
};

export type InsertArtist = {
  name: string;
  image_url?: string | null;
  bio?: string | null;
  genres?: string[] | null;
};

export type InsertAlbum = {
  title: string;
  artist_id?: string | null;
  cover_url?: string | null;
  year?: number | null;
  genre?: string | null;
  language?: string | null;
  description?: string | null;
};

// ── Client ────────────────────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = url && key ? createClient(url, key) : null;

export const isSupabaseConfigured = () => !!supabase;

// ── Songs ─────────────────────────────────────────────────────────────────────

export async function fetchSongs(): Promise<DbSong[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('songs')
    .select('*, artists(id, name, image_url), albums(id, title, cover_url)')
    .order('created_at', { ascending: false });
  if (error) { console.error('[supabase] fetchSongs:', error.message); return []; }
  return (data as DbSong[]) ?? [];
}

export async function fetchSongById(id: string): Promise<DbSong | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('songs')
    .select('*, artists(id, name, image_url), albums(id, title, cover_url)')
    .eq('id', id)
    .single();
  if (error) { console.error('[supabase] fetchSongById:', error.message); return null; }
  return data as DbSong;
}

export async function insertSong(song: InsertSong): Promise<DbSong> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('songs').insert(song).select().single();
  if (error) throw error;
  return data as DbSong;
}

export async function deleteSong(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('songs').delete().eq('id', id);
  if (error) throw error;
}

export async function incrementPlays(id: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.rpc('increment_plays', { song_id: id });
  } catch {
    // graceful — RPC may not exist, ignore
  }
}

// ── Artists ───────────────────────────────────────────────────────────────────

export async function fetchArtists(): Promise<DbArtist[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('artists').select('*').order('name');
  if (error) { console.error('[supabase] fetchArtists:', error.message); return []; }
  return (data as DbArtist[]) ?? [];
}

export async function fetchArtistByName(name: string): Promise<DbArtist | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('artists').select('*').ilike('name', name).limit(1).single();
  return (data as DbArtist) ?? null;
}

export async function insertArtist(artist: InsertArtist): Promise<DbArtist> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('artists').insert(artist).select().single();
  if (error) throw error;
  return data as DbArtist;
}

export async function upsertArtist(name: string, imageUrl?: string): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  // Check if exists
  const { data: existing } = await supabase
    .from('artists')
    .select('id')
    .ilike('name', name)
    .limit(1)
    .single();
  if (existing) return (existing as { id: string }).id;
  // Create new
  const artist = await insertArtist({ name, image_url: imageUrl ?? null });
  return artist.id;
}

// ── Albums ────────────────────────────────────────────────────────────────────

export async function fetchAlbums(): Promise<DbAlbum[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('albums')
    .select('*, artists(id, name, image_url)')
    .order('created_at', { ascending: false });
  if (error) { console.error('[supabase] fetchAlbums:', error.message); return []; }
  return (data as DbAlbum[]) ?? [];
}

export async function insertAlbum(album: InsertAlbum): Promise<DbAlbum> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('albums').insert(album).select().single();
  if (error) throw error;
  return data as DbAlbum;
}

export async function upsertAlbum(
  title: string,
  artistId: string,
  coverUrl?: string,
  year?: number,
  genre?: string,
  language?: string
): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: existing } = await supabase
    .from('albums')
    .select('id')
    .ilike('title', title)
    .eq('artist_id', artistId)
    .limit(1)
    .single();
  if (existing) return (existing as { id: string }).id;
  const album = await insertAlbum({
    title,
    artist_id: artistId,
    cover_url: coverUrl ?? null,
    year: year ?? null,
    genre: genre ?? null,
    language: language ?? null,
  });
  return album.id;
}

// ── Liked Songs ───────────────────────────────────────────────────────────────

export async function likeSong(userId: string, songId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('liked_songs')
    .upsert({ user_id: userId, song_id: songId }, { onConflict: 'user_id,song_id' });
}

export async function unlikeSong(userId: string, songId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', userId)
    .eq('song_id', songId);
}

export async function fetchLikedSongs(userId: string): Promise<DbSong[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('liked_songs')
    .select('songs(*, artists(id, name, image_url), albums(id, title, cover_url))')
    .eq('user_id', userId)
    .order('liked_at', { ascending: false });
  return ((data ?? []) as unknown as { songs: DbSong }[]).map((r) => r.songs).filter(Boolean);
}

// ── Recently Played ───────────────────────────────────────────────────────────

export async function addRecentlyPlayedDB(userId: string, songId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('recently_played').insert({ user_id: userId, song_id: songId });
}

export async function fetchRecentlyPlayed(userId: string, limit = 20): Promise<DbSong[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('recently_played')
    .select('songs(*, artists(id, name, image_url), albums(id, title, cover_url))')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as { songs: DbSong }[]).map((r) => r.songs).filter(Boolean);
}

// ── Playlists ─────────────────────────────────────────────────────────────────

export async function fetchPlaylists(userId: string): Promise<DbPlaylist[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data as DbPlaylist[]) ?? [];
}

export async function fetchPlaylistSongs(playlistId: string): Promise<DbSong[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('playlist_songs')
    .select('songs(*, artists(id, name, image_url), albums(id, title, cover_url))')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });
  return ((data ?? []) as unknown as { songs: DbSong }[]).map((r) => r.songs).filter(Boolean);
}

export async function addToPlaylistDB(
  playlistId: string,
  songId: string,
  position: number
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('playlist_songs')
    .upsert({ playlist_id: playlistId, song_id: songId, position }, { onConflict: 'playlist_id,song_id' });
}

export async function removeFromPlaylistDB(playlistId: string, songId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId);
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from(bucket).remove([path]);
}

export function getPublicUrl(bucket: string, path: string): string {
  if (!supabase) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchAll(query: string): Promise<{
  songs: DbSong[];
  artists: DbArtist[];
  albums: DbAlbum[];
}> {
  if (!supabase || !query.trim()) return { songs: [], artists: [], albums: [] };
  const q = `%${query}%`;
  const [songsRes, artistsRes, albumsRes] = await Promise.all([
    supabase
      .from('songs')
      .select('*, artists(id, name, image_url), albums(id, title, cover_url)')
      .or(`title.ilike.${q},genre.ilike.${q}`)
      .limit(15),
    supabase.from('artists').select('*').ilike('name', q).limit(6),
    supabase.from('albums').select('*, artists(id, name, image_url)').ilike('title', q).limit(6),
  ]);
  return {
    songs: (songsRes.data as DbSong[]) ?? [],
    artists: (artistsRes.data as DbArtist[]) ?? [],
    albums: (albumsRes.data as DbAlbum[]) ?? [],
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a DbSong row to the app-level Song type */
export function dbSongToSong(db: DbSong): import('@/types').Song {
  return {
    id: db.id,
    title: db.title,
    artist: db.artists?.name ?? 'Unknown Artist',
    artistId: db.artist_id ?? undefined,
    album: db.albums?.title ?? '',
    albumId: db.album_id ?? undefined,
    coverUrl:
      db.cover_url ||
      db.albums?.cover_url ||
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    audioUrl: db.audio_url,
    duration: db.duration ?? '0:00',
    durationSeconds: 0,
    genre: db.genre ?? '',
    language: db.language ?? '',
    year: db.year ?? new Date().getFullYear(),
    plays: db.plays,
    lyrics: db.lyrics ?? undefined,
    isLocal: false,
  };
}

/** Convert a DbArtist row to the app-level Artist type */
export function dbArtistToArtist(db: DbArtist): import('@/types').Artist {
  return {
    id: db.id,
    name: db.name,
    imageUrl: db.image_url ?? '',
    bio: db.bio ?? undefined,
    genres: db.genres ?? undefined,
  };
}
