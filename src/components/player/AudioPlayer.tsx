'use client';

import { useEffect, useRef } from 'react';
import PlayerControls from '@/components/player/PlayerControls';
import ProgressBar from '@/components/player/ProgressBar';
import VolumeControl from '@/components/player/VolumeControl';
import {
  AUDIO_LINK_ERROR_MESSAGE,
  isExternalUrl,
  isPlaceholderAudioUrl,
  playerActions,
  startSongStorageSync,
  usePlayerStore,
} from '@/store/playerStore';

const canAttemptPlayback = (audioUrl: string) => {
  return !isPlaceholderAudioUrl(audioUrl) && isExternalUrl(audioUrl);
};

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    shuffle,
    errorMessage,
    toastMessage,
    playbackRequestId,
  } = usePlayerStore();

  useEffect(() => {
    return startSongStorageSync();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    if (!isPlaying) {
      audio.pause();
      return;
    }

    if (!canAttemptPlayback(currentTrack.audioUrl)) {
      playerActions.setAudioError(AUDIO_LINK_ERROR_MESSAGE);
      return;
    }

    let isCancelled = false;

    const playCurrentTrack = async () => {
      try {
        const nextSource = new URL(currentTrack.audioUrl.trim()).href;

        if (audio.src !== nextSource) {
          audio.pause();
          audio.src = nextSource;
          audio.load();
          playerActions.setCurrentTime(0);
        }

        playerActions.setBuffering(true);
        await audio.play();

        if (!isCancelled) {
          playerActions.setAudioReady();
        }
      } catch {
        if (!isCancelled) {
          playerActions.setAudioError(AUDIO_LINK_ERROR_MESSAGE);
        }
      }
    };

    void playCurrentTrack();

    return () => {
      isCancelled = true;
    };
  }, [currentTrack, isPlaying, playbackRequestId]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      playerActions.clearToast();
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const handleSeek = (time: number) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(time)) {
      return;
    }

    audio.currentTime = time;
    playerActions.seek(time);
  };

  const hasTrack = Boolean(currentTrack);

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadStart={() => {
          if (isPlaying) {
            playerActions.setBuffering(true);
          }
        }}
        onWaiting={() => playerActions.setBuffering(true)}
        onCanPlay={() => playerActions.setBuffering(false)}
        onPlaying={() => playerActions.setAudioReady()}
        onLoadedMetadata={(event) => playerActions.setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => playerActions.setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => playerActions.setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => playerActions.handleEnded()}
        onError={() => {
          if (currentTrack?.audioUrl) {
            playerActions.setAudioError(AUDIO_LINK_ERROR_MESSAGE);
          }
        }}
      />

      {toastMessage && (
        <div className="fixed left-1/2 top-5 z-[90] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 rounded-[8px] border border-berry-400/35 bg-berry-500/15 px-4 py-3 text-sm font-semibold text-berry-400 shadow-player backdrop-blur-xl">
          {toastMessage}
        </div>
      )}

      <section className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/92 px-3 py-3 shadow-player backdrop-blur-2xl sm:px-5">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(230px,1fr)_minmax(360px,1.4fr)_minmax(220px,0.8fr)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.06]">
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={`${currentTrack.title} cover`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-lg font-black text-aqua-300">VS</span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {currentTrack?.title ?? 'Select a song'}
              </p>
              <p className="truncate text-xs text-white/50">
                {currentTrack ? `${currentTrack.artist} - ${currentTrack.album}` : 'VibeStream is ready'}
              </p>
              {errorMessage && (
                <p className="mt-1 truncate text-xs font-semibold text-berry-400">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <PlayerControls
              isPlaying={isPlaying}
              isBuffering={isBuffering}
              shuffle={shuffle}
              repeatMode={repeatMode}
              onPlayPause={() => playerActions.togglePlay()}
              onPrevious={() => playerActions.previous(true)}
              onNext={() => playerActions.next(true)}
              onToggleShuffle={() => playerActions.toggleShuffle()}
              onCycleRepeat={() => playerActions.cycleRepeatMode()}
            />
            <div className="mt-2">
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                isBuffering={isBuffering}
                onSeek={handleSeek}
              />
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={(nextVolume) => playerActions.setVolume(nextVolume)}
              onToggleMute={() => playerActions.toggleMute()}
            />
          </div>

          <div className="flex justify-center lg:hidden">
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={(nextVolume) => playerActions.setVolume(nextVolume)}
              onToggleMute={() => playerActions.toggleMute()}
            />
          </div>

          {!hasTrack && (
            <p className="sr-only">Add songs from the Manage Songs page to start playback.</p>
          )}
        </div>
      </section>
    </>
  );
}
