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
  // Set metadata + handlers when song changes
  useEffect(() => {
    if (!('mediaSession' in navigator) || !song) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title:  song.title,
      artist: song.artist,
      album:  song.album,
      artwork: [
        { src: song.coverUrl, sizes: '96x96',   type: 'image/jpeg' },
        { src: song.coverUrl, sizes: '256x256',  type: 'image/jpeg' },
        { src: song.coverUrl, sizes: '512x512',  type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play',          actions.onPlay);
    navigator.mediaSession.setActionHandler('pause',         actions.onPause);
    navigator.mediaSession.setActionHandler('nexttrack',     actions.onNext);
    navigator.mediaSession.setActionHandler('previoustrack', actions.onPrevious);

    // Seek-to (e.g. lock-screen progress scrub)
    if (actions.onSeek) {
      navigator.mediaSession.setActionHandler('seekto', (e) => {
        if (e.seekTime != null) actions.onSeek!(e.seekTime);
      });
    }

    // 10-second skip buttons (appear on lock screen / notification shade)
    navigator.mediaSession.setActionHandler('seekbackward', (e) => {
      const audio = document.querySelector('audio');
      if (audio) {
        const skip = e.seekOffset ?? 10;
        audio.currentTime = Math.max(0, audio.currentTime - skip);
        actions.onSeek?.(audio.currentTime);
      }
    });
    navigator.mediaSession.setActionHandler('seekforward', (e) => {
      const audio = document.querySelector('audio');
      if (audio) {
        const skip = e.seekOffset ?? 10;
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + skip);
        actions.onSeek?.(audio.currentTime);
      }
    });

    return () => {
      const handlers: MediaSessionAction[] = [
        'play', 'pause', 'nexttrack', 'previoustrack',
        'seekto', 'seekbackward', 'seekforward',
      ];
      handlers.forEach((a) => {
        try { navigator.mediaSession.setActionHandler(a, null); } catch {}
      });
    };
  }, [song?.id]);

  // Update playback state whenever playing status changes
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Update position state for accurate lock-screen progress bar
  useEffect(() => {
    if (!('mediaSession' in navigator) || !song) return;
    const audio = document.querySelector('audio');
    if (!audio || !audio.duration) return;

    try {
      navigator.mediaSession.setPositionState?.({
        duration:     audio.duration,
        playbackRate: audio.playbackRate || 1,
        position:     Math.min(audio.currentTime, audio.duration),
      });
    } catch {}
  }, [song?.id, isPlaying]);
}
