'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useMediaSession } from '@/hooks/useMediaSession';

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSrcRef = useRef<string>('');

  const {
    currentSong, isPlaying, volume, isMuted, currentTime,
    playbackRequestId, repeatMode,
    setCurrentTime, setDuration, setBuffering, setPlaying, setError, handleEnded, next,
  } = usePlayerStore();

  const { addRecentlyPlayed } = useLibraryStore();

  // ── Init audio element ────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;
    }
    const audio = audioRef.current;

    const onTimeUpdate  = () => setCurrentTime(audio.currentTime);
    const onDuration    = () => setDuration(audio.duration || 0);
    const onWaiting     = () => setBuffering(true);
    const onCanPlay     = () => setBuffering(false);
    const onPlaying     = () => { setBuffering(false); setPlaying(true); };
    const onPause       = () => setPlaying(false);
    const onEnded       = () => handleEnded();
    const onError       = () => {
      if (audio.src) setError('Unable to play this track. Skipping…');
    };

    audio.addEventListener('timeupdate',    onTimeUpdate);
    audio.addEventListener('durationchange',onDuration);
    audio.addEventListener('waiting',       onWaiting);
    audio.addEventListener('canplay',       onCanPlay);
    audio.addEventListener('playing',       onPlaying);
    audio.addEventListener('pause',         onPause);
    audio.addEventListener('ended',         onEnded);
    audio.addEventListener('error',         onError);

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('waiting',        onWaiting);
      audio.removeEventListener('canplay',        onCanPlay);
      audio.removeEventListener('playing',        onPlaying);
      audio.removeEventListener('pause',          onPause);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('error',          onError);
    };
  }, []);

  // ── Volume / mute ─────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.muted  = isMuted;
  }, [volume, isMuted]);

  // ── Load + play new track ─────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const src = currentSong.audioUrl.trim();
    if (!src) { setError('No audio URL for this track.'); return; }

    let cancelled = false;

    const load = async () => {
      try {
        if (audio.src !== src || lastSrcRef.current !== src) {
          audio.pause();
          audio.src = src;
          lastSrcRef.current = src;
          audio.load();
          setCurrentTime(0);
        }

        if (isPlaying) {
          setBuffering(true);
          await audio.play();
          if (!cancelled) {
            addRecentlyPlayed(currentSong);
          }
        } else {
          audio.pause();
        }
      } catch (err) {
        if (!cancelled) {
          const e = err as Error;
          if (e.name !== 'AbortError') setError('Playback failed. Try another track.');
        }
      }
    };

    void load();

    return () => { cancelled = true; };
  }, [currentSong?.id, playbackRequestId]);

  // ── Play / pause toggle ───────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.play().catch((e) => {
        if ((e as Error).name !== 'AbortError') setError('Playback error.');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // ── Seek ──────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 1.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // ── Media Session ─────────────────────────────────────────
  const msActions = {
    onPlay:     () => usePlayerStore.getState().play(),
    onPause:    () => usePlayerStore.getState().pause(),
    onNext:     () => usePlayerStore.getState().next(),
    onPrevious: () => usePlayerStore.getState().previous(),
    onSeek:     (t: number) => {
      if (audioRef.current) audioRef.current.currentTime = t;
      setCurrentTime(t);
    },
  };
  useMediaSession(currentSong, isPlaying, msActions);

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const { togglePlay, next, previous, setVolume, volume } = usePlayerStore.getState();
      if (e.code === 'Space')           { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight' && e.ctrlKey) { e.preventDefault(); next(); }
      if (e.code === 'ArrowLeft'  && e.ctrlKey) { e.preventDefault(); previous(); }
      if (e.code === 'ArrowUp'    && e.ctrlKey) { e.preventDefault(); setVolume(Math.min(1, volume + 0.1)); }
      if (e.code === 'ArrowDown'  && e.ctrlKey) { e.preventDefault(); setVolume(Math.max(0, volume - 0.1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
