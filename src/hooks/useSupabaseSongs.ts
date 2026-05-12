'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSongs } from '@/lib/songService';
import { songs as staticSongs } from '@/data/songs';
import type { Song } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * useSupabaseSongs
 *
 * Fetches songs from Supabase and merges them with the static song list.
 * - If Supabase is configured: DB songs appear first, then static demo songs
 * - If Supabase is not configured: only static demo songs are used
 * - Re-exportable `refresh()` to refetch on demand (e.g. after upload)
 */
export function useSupabaseSongs() {
  const [dbSongs, setDbSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<Status>('idle');

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setStatus('success');
      return;
    }
    setStatus('loading');
    try {
      const data = await getSongs();
      setDbSongs(data);
      setStatus('success');
    } catch (err) {
      console.error('[useSupabaseSongs]', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  // DB songs first, then static songs that aren't already in DB
  const dbIds = new Set(dbSongs.map((s) => s.id));
  const merged: Song[] = [
    ...dbSongs,
    ...staticSongs.filter((s) => !dbIds.has(s.id)),
  ];

  return {
    songs: merged,
    dbSongs,
    staticSongs,
    isLoading: status === 'loading',
    isError: status === 'error',
    refresh: fetch,
  };
}
