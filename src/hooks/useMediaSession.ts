'use client';

import { useEffect } from 'react';
import type { Song } from '@/types';

type Actions = {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek?: (t: number) => void;
};

export function useMediaSession(
  song: Song | null,
  isPlaying: boolean,
  actions: Actions
) {
  useEffect(() => {
    if (!('mediaSession' in navigator) || !song) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: [
        { src: song.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        { src: song.coverUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: song.coverUrl, sizes: '96x96', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', actions.onPlay);
    navigator.mediaSession.setActionHandler('pause', actions.onPause);
    navigator.mediaSession.setActionHandler('nexttrack', actions.onNext);
    navigator.mediaSession.setActionHandler('previoustrack', actions.onPrevious);
    if (actions.onSeek) {
      navigator.mediaSession.setActionHandler('seekto', (e) => {
        if (e.seekTime != null) actions.onSeek!(e.seekTime);
      });
    }

    return () => {
      ['play', 'pause', 'nexttrack', 'previoustrack', 'seekto'].forEach((a) => {
        try {
          navigator.mediaSession.setActionHandler(
            a as MediaSessionAction,
            null
          );
        } catch {}
      });
    };
  }, [song, isPlaying]);
}
