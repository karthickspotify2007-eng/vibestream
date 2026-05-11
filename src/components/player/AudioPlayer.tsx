'use client';

import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
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
import type { Song } from '@/types/music';

const canAttemptPlayback = (audioUrl: string) => {
  return !isPlaceholderAudioUrl(audioUrl) && isExternalUrl(audioUrl);
};

const stopPlayerClick = (event: MouseEvent<HTMLElement>) => {
  event.stopPropagation();
};

const MiniPlayIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    {isPlaying ? (
      <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
    ) : (
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    )}
  </svg>
);

const CloseIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DeviceIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const AddIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CoverArt = ({
  track,
  className,
  fallbackClassName,
}: {
  track: Song | null;
  className: string;
  fallbackClassName: string;
}) => (
  <div className={className}>
    {track?.coverUrl ? (
      <img
        src={track.coverUrl}
        alt={`${track.title} cover`}
        className="h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    ) : (
      <span className={fallbackClassName}>VS</span>
    )}
  </div>
);

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
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

  const handleMiniKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsNowPlayingOpen(true);
    }
  };

  const handleMiniPlayClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    playerActions.togglePlay();
  };

  const progressPercent =
    duration > 0 && Number.isFinite(duration) ? Math.min((currentTime / duration) * 100, 100) : 0;
  const statusText = isBuffering ? 'Buffering' : isPlaying ? 'Playing' : 'Tap to open player';

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
        <div className="fixed left-1/2 top-5 z-[100] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 rounded-[8px] border border-berry-400/35 bg-berry-500/15 px-4 py-3 text-sm font-semibold text-berry-400 shadow-player backdrop-blur-xl">
          {toastMessage}
        </div>
      )}

      {isNowPlayingOpen && (
        <section className="fixed inset-0 z-[90] overflow-y-auto bg-[linear-gradient(180deg,#1f7f73_0%,#111414_42%,#070809_100%)] px-5 pb-8 pt-4 text-white sm:px-8">
          <div className="mx-auto flex min-h-full max-w-xl flex-col">
            <header className="flex h-12 items-center justify-between">
              <button
                type="button"
                aria-label="Close full screen player"
                title="Close player"
                onClick={() => setIsNowPlayingOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-white/85 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <CloseIcon />
              </button>
              <div className="min-w-0 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">
                  VibeStream
                </p>
                <p className="truncate text-sm font-bold">{currentTrack?.album ?? 'Music Library'}</p>
              </div>
              <button
                type="button"
                aria-label="More options"
                title="Options"
                className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span className="text-2xl leading-none">...</span>
              </button>
            </header>

            <div className="flex flex-1 flex-col justify-center py-6">
              <CoverArt
                track={currentTrack}
                className="mx-auto grid aspect-square w-full max-w-[430px] place-items-center overflow-hidden rounded-[8px] bg-white/[0.08] shadow-[0_28px_90px_rgba(0,0,0,0.45)]"
                fallbackClassName="text-6xl font-black text-aqua-300"
              />

              <div className="mt-8 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black sm:text-3xl">
                    {currentTrack?.title ?? 'Select a song'}
                  </h2>
                  <p className="mt-1 truncate text-base font-semibold text-white/58">
                    {currentTrack ? `${currentTrack.artist} - ${currentTrack.album}` : 'VibeStream is ready'}
                  </p>
                  {errorMessage && (
                    <p className="mt-2 text-sm font-semibold text-berry-400">{errorMessage}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Add song"
                  title="Add song"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 text-white transition hover:border-aqua-300 hover:text-aqua-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-aqua-300"
                >
                  <AddIcon />
                </button>
              </div>

              <div className="mt-7">
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  isBuffering={isBuffering}
                  onSeek={handleSeek}
                />
              </div>

              <div className="mt-7">
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
              </div>

              <div className="mt-7 flex justify-center">
                <VolumeControl
                  volume={volume}
                  isMuted={isMuted}
                  onVolumeChange={(nextVolume) => playerActions.setVolume(nextVolume)}
                  onToggleMute={() => playerActions.toggleMute()}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        role="button"
        tabIndex={0}
        aria-label="Open full screen player"
        onClick={() => setIsNowPlayingOpen(true)}
        onKeyDown={handleMiniKeyDown}
        className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl cursor-pointer overflow-hidden rounded-[8px] border border-white/10 bg-berry-500/95 text-white shadow-player backdrop-blur-xl transition hover:bg-berry-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-aqua-300 sm:inset-x-5"
      >
        <div className="grid h-[68px] grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 px-2.5 pr-3">
          <CoverArt
            track={currentTrack}
            className="grid h-12 w-12 place-items-center overflow-hidden rounded-[6px] bg-black/20"
            fallbackClassName="text-sm font-black text-aqua-300"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-black leading-tight">
              {currentTrack?.title ?? 'Select a song'}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-white/68">
              {currentTrack?.artist ?? statusText}
            </p>
          </div>

          <div className="flex items-center gap-1.5" onClick={stopPlayerClick}>
            <button
              type="button"
              aria-label="Device"
              title="Device"
              className="hidden h-10 w-10 place-items-center rounded-full text-white/86 transition hover:bg-white/10 sm:grid"
            >
              <DeviceIcon />
            </button>
            <button
              type="button"
              aria-label="Add song"
              title="Add song"
              className="grid h-10 w-10 place-items-center rounded-full text-white/86 transition hover:bg-white/10"
            >
              <AddIcon />
            </button>
            <button
              type="button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              aria-pressed={isPlaying}
              title={isPlaying ? 'Pause' : 'Play'}
              onClick={handleMiniPlayClick}
              className="grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <MiniPlayIcon isPlaying={isPlaying} />
            </button>
          </div>
        </div>
        <div className="h-1 bg-white/16">
          <div
            className="h-full bg-white transition-[width] duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>
    </>
  );
}
