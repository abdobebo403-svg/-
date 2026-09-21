import { useState, useRef, useEffect, useCallback } from 'react';
import { Reciter } from '../types';
import { RECITERS, getAyahAudioUrl } from '../data/reciters';
import { SURAH_METADATA } from '../data/quranMetadata';

export type RepeatMode = 'none' | 'ayah' | 'surah';

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentSurahNumber: number | null;
  currentAyahNumber: number | null;
  activeReciter: Reciter;
  repeatMode: RepeatMode;
  playbackSpeed: number;
  currentTime: number;
  duration: number;
  errorMessage: string | null;
}

export function useAudioPlayer() {
  const [activeReciter, setActiveReciterState] = useState<Reciter>(() => {
    const saved = localStorage.getItem('quran_reciter_id');
    const found = RECITERS.find(r => r.id === saved);
    return found || RECITERS[0];
  });

  const [currentSurahNumber, setCurrentSurahNumber] = useState<number | null>(null);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null);
  const [totalAyahsInSurah, setTotalAyahsInSurah] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const surahMetaRef = useRef<{ surah: number; ayah: number; total: number } | null>(null);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setErrorMessage(null);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onCanPlay = () => {
      setIsLoading(false);
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setErrorMessage('تعذر تشغيل الصوت، تحقق من الاتصال بالإنترنت.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Update MediaSession on Android
  useEffect(() => {
    if ('mediaSession' in navigator && currentSurahNumber && currentAyahNumber) {
      const meta = SURAH_METADATA.find(s => s.number === currentSurahNumber);
      const surahName = meta ? meta.name : `سورة ${currentSurahNumber}`;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${surahName} - آية ${currentAyahNumber}`,
        artist: activeReciter.name,
        album: 'القرآن الكريم',
        artwork: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevAyah();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextAyah();
      });
    }
  }, [currentSurahNumber, currentAyahNumber, activeReciter]);

  const playAyah = useCallback((surahNumber: number, ayahNumber: number, totalAyahs: number) => {
    if (!audioRef.current) return;
    setErrorMessage(null);
    setIsLoading(true);

    const url = getAyahAudioUrl(activeReciter.folder, surahNumber, ayahNumber);
    audioRef.current.src = url;
    audioRef.current.playbackRate = playbackSpeed;

    setCurrentSurahNumber(surahNumber);
    setCurrentAyahNumber(ayahNumber);
    setTotalAyahsInSurah(totalAyahs);
    surahMetaRef.current = { surah: surahNumber, ayah: ayahNumber, total: totalAyahs };

    audioRef.current.play().catch(err => {
      console.warn('Autoplay prevented or interrupted:', err);
      setIsLoading(false);
      setIsPlaying(false);
    });
  }, [activeReciter, playbackSpeed]);

  const handleNextAyah = useCallback(() => {
    if (!currentSurahNumber || !currentAyahNumber) return;
    if (currentAyahNumber < totalAyahsInSurah) {
      playAyah(currentSurahNumber, currentAyahNumber + 1, totalAyahsInSurah);
    } else {
      // End of Surah
      if (repeatMode === 'surah') {
        playAyah(currentSurahNumber, 1, totalAyahsInSurah);
      } else if (currentSurahNumber < 114) {
        // Next surah
        const nextMeta = SURAH_METADATA.find(s => s.number === currentSurahNumber + 1);
        if (nextMeta) {
          playAyah(nextMeta.number, 1, nextMeta.numberOfAyahs);
        }
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentSurahNumber, currentAyahNumber, totalAyahsInSurah, repeatMode, playAyah]);

  const handlePrevAyah = useCallback(() => {
    if (!currentSurahNumber || !currentAyahNumber) return;
    if (currentAyahNumber > 1) {
      playAyah(currentSurahNumber, currentAyahNumber - 1, totalAyahsInSurah);
    } else if (currentSurahNumber > 1) {
      const prevMeta = SURAH_METADATA.find(s => s.number === currentSurahNumber - 1);
      if (prevMeta) {
        playAyah(prevMeta.number, prevMeta.numberOfAyahs, prevMeta.numberOfAyahs);
      }
    }
  }, [currentSurahNumber, currentAyahNumber, totalAyahsInSurah, playAyah]);

  // Handle ended event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatMode === 'ayah') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextAyah();
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode, handleNextAyah]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioRef.current.src) {
        audioRef.current.play().catch(e => {
          console.warn('Play error:', e);
        });
      } else if (currentSurahNumber && currentAyahNumber) {
        playAyah(currentSurahNumber, currentAyahNumber, totalAyahsInSurah);
      }
    }
  };

  const seekTo = (fraction: number) => {
    if (!audioRef.current || !duration) return;
    const target = fraction * duration;
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const setReciter = (reciter: Reciter) => {
    setActiveReciterState(reciter);
    localStorage.setItem('quran_reciter_id', reciter.id);

    // If currently playing, switch source to new reciter seamlessly
    if (currentSurahNumber && currentAyahNumber && audioRef.current) {
      const wasPlaying = isPlaying;
      const url = getAyahAudioUrl(reciter.folder, currentSurahNumber, currentAyahNumber);
      audioRef.current.src = url;
      if (wasPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentSurahNumber(null);
    setCurrentAyahNumber(null);
  };

  return {
    isPlaying,
    isLoading,
    currentSurahNumber,
    currentAyahNumber,
    totalAyahsInSurah,
    activeReciter,
    repeatMode,
    playbackSpeed,
    currentTime,
    duration,
    errorMessage,
    playAyah,
    togglePlay,
    nextAyah: handleNextAyah,
    prevAyah: handlePrevAyah,
    seekTo,
    setReciter,
    setPlaybackSpeed,
    setRepeatMode,
    stop,
  };
}
