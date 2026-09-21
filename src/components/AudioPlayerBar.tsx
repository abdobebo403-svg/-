import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Repeat, Volume2, User, Loader2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Reciter } from '../types';
import { RECITERS } from '../data/reciters';
import { SURAH_METADATA } from '../data/quranMetadata';
import { RepeatMode } from '../hooks/useAudioPlayer';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  isLoading: boolean;
  currentSurahNumber: number | null;
  currentAyahNumber: number | null;
  totalAyahsInSurah: number;
  activeReciter: Reciter;
  repeatMode: RepeatMode;
  playbackSpeed: number;
  currentTime: number;
  duration: number;
  errorMessage: string | null;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (fraction: number) => void;
  onSelectReciter: (reciter: Reciter) => void;
  onSpeedChange: (speed: number) => void;
  onRepeatModeChange: (mode: RepeatMode) => void;
  onClose: () => void;
  onScrollToCurrentAyah?: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
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
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onSelectReciter,
  onSpeedChange,
  onRepeatModeChange,
  onClose,
  onScrollToCurrentAyah,
}) => {
  const [showReciterList, setShowReciterList] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentSurahNumber || !currentAyahNumber) {
    return null;
  }

  const surahMeta = SURAH_METADATA.find(s => s.number === currentSurahNumber);
  const surahName = surahMeta ? surahMeta.name : `سورة ${currentSurahNumber}`;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const cycleRepeatMode = () => {
    if (repeatMode === 'none') onRepeatModeChange('ayah');
    else if (repeatMode === 'ayah') onRepeatModeChange('surah');
    else onRepeatModeChange('none');
  };

  const cycleSpeed = () => {
    if (playbackSpeed === 1) onSpeedChange(1.25);
    else if (playbackSpeed === 1.25) onSpeedChange(1.5);
    else if (playbackSpeed === 1.5) onSpeedChange(0.75);
    else onSpeedChange(1);
  };

  return (
    <div
      id="android-audio-player-bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-stone-900/95 dark:bg-stone-950/98 backdrop-blur-md text-white border-t border-emerald-800/40 shadow-2xl transition-all duration-300"
    >
      {/* Visual seek progress bar on the top border */}
      <div
        className="w-full h-1 bg-stone-800 cursor-pointer relative group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          // In RTL layout: clicking on the right is earlier or standard left-to-right?
          // To be intuitive, let's use clientX relative to width:
          const fraction = Math.max(0, Math.min(1, clickX / rect.width));
          onSeek(fraction);
        }}
      >
        <div
          className="h-full bg-amber-400 group-hover:bg-amber-300 transition-all duration-100 relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-300 shadow opacity-0 group-hover:opacity-100 transition" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3">
        {errorMessage && (
          <div className="text-xs text-rose-300 mb-1.5 text-center bg-rose-950/60 py-1 px-3 rounded-lg border border-rose-800/50">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {/* Track Info */}
          <div
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
            onClick={onScrollToCurrentAyah}
            title="انقر للانتقال إلى الآية"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md">
              <Volume2 className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-amber-300 truncate font-['Cairo',sans-serif]">
                  سورة {surahName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 shrink-0 font-sans">
                  الآية {currentAyahNumber} من {totalAyahsInSurah}
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate flex items-center gap-1.5 mt-0.5">
                <span>بصوت:</span>
                <span className="text-stone-200 font-medium">{activeReciter.name}</span>
              </p>
            </div>
          </div>

          {/* Player Core Controls (Android Style) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Previous Ayah */}
            <button
              id="audio-prev-ayah"
              onClick={onPrev}
              disabled={currentAyahNumber <= 1 && currentSurahNumber <= 1}
              className="p-2 sm:p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/80 disabled:opacity-40 transition"
              aria-label="الآية السابقة"
              title="الآية السابقة"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Play/Pause Button */}
            <button
              id="audio-play-pause"
              onClick={onTogglePlay}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold flex items-center justify-center shadow-lg hover:shadow-amber-500/20 active:scale-95 transition"
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Next Ayah */}
            <button
              id="audio-next-ayah"
              onClick={onNext}
              className="p-2 sm:p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/80 transition"
              aria-label="الآية التالية"
              title="الآية التالية"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Reciter Picker Toggle */}
            <div className="relative">
              <button
                id="audio-reciter-menu-btn"
                onClick={() => setShowReciterList(!showReciterList)}
                className={`p-2 sm:p-2.5 rounded-xl transition ${
                  showReciterList
                    ? 'bg-emerald-800 text-amber-300'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                }`}
                aria-label="اختيار القارئ"
                title="تغيير القارئ"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Reciters Dropdown */}
              {showReciterList && (
                <div
                  id="reciters-popover"
                  className="absolute bottom-full left-0 mb-3 w-64 max-h-80 overflow-y-auto rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-2 z-50 divide-y divide-stone-800/60"
                >
                  <div className="px-3 py-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    اختر القارئ
                  </div>
                  {RECITERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectReciter(r);
                        setShowReciterList(false);
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between transition ${
                        activeReciter.id === r.id
                          ? 'bg-emerald-900/60 text-amber-300 font-bold'
                          : 'text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      <div>
                        <div>{r.name}</div>
                        <div className="text-[11px] text-stone-400 font-normal">{r.subname}</div>
                      </div>
                      {activeReciter.id === r.id && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Repeat Mode */}
            <button
              id="audio-repeat-mode-btn"
              onClick={cycleRepeatMode}
              className={`p-2 sm:p-2.5 rounded-xl transition relative ${
                repeatMode !== 'none'
                  ? 'bg-emerald-900 text-amber-300 border border-emerald-700'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/80'
              }`}
              title={
                repeatMode === 'none'
                  ? 'التكرار: معطل'
                  : repeatMode === 'ayah'
                  ? 'تكرار الآية الحالية'
                  : 'تكرار السورة كاملة'
              }
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === 'ayah' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-stone-950 rounded-full text-[9px] font-bold flex items-center justify-center">
                  1
                </span>
              )}
              {repeatMode === 'surah' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  ∞
                </span>
              )}
            </button>

            {/* Playback Speed */}
            <button
              id="audio-speed-btn"
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-lg text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 transition"
              title="سرعة التلاوة"
            >
              {playbackSpeed}x
            </button>

            {/* Close / Stop */}
            <button
              id="audio-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-300 hover:bg-stone-800/80 transition"
              aria-label="إغلاق المشغل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Time elapsed / remaining */}
        <div className="flex justify-between text-[11px] text-stone-400 px-1 mt-1 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
