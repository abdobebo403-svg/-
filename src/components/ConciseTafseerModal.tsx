import React, { useState, useEffect } from 'react';
import { BookOpen, X, Play, Volume2, Bookmark as BookmarkIcon, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { ArabicFont } from '../types';
import { fetchAyahTafseer } from '../services/quranApi';

export interface ConciseTafseerTarget {
  surahNumber: number;
  surahName: string;
  numberInSurah: number;
  text: string;
  tafseer?: string;
  numberOfAyahs?: number;
}

interface ConciseTafseerModalProps {
  target: ConciseTafseerTarget | null;
  onClose: () => void;
  onPlayAyah?: (surahNumber: number, ayahNumber: number, totalAyahs: number) => void;
  isCurrentlyPlaying?: boolean;
  onToggleBookmark?: (target: ConciseTafseerTarget) => void;
  isBookmarked?: boolean;
  font: ArabicFont;
}

export const ConciseTafseerModal: React.FC<ConciseTafseerModalProps> = ({
  target,
  onClose,
  onPlayAyah,
  isCurrentlyPlaying = false,
  onToggleBookmark,
  isBookmarked = false,
  font,
}) => {
  const [tafseerText, setTafseerText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!target) {
      setTafseerText(null);
      return;
    }

    if (target.tafseer && target.tafseer.trim().length > 0) {
      setTafseerText(target.tafseer);
      setIsLoading(false);
      return;
    }

    // Fetch from Tafseer API
    let isMounted = true;
    setIsLoading(true);
    setTafseerText(null);

    fetchAyahTafseer(target.surahNumber, target.numberInSurah)
      .then((res) => {
        if (isMounted) {
          setTafseerText(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTafseerText('تعذر جلب التفسير، يرجى المحاولة لاحقاً.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [target]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!target) return null;

  const getFontFamily = (f: ArabicFont) => {
    switch (f) {
      case 'amiri-quran':
        return "'Amiri Quran', serif";
      case 'cairo':
        return "'Cairo', sans-serif";
      case 'scheherazade':
        return "'Scheherazade New', serif";
      default:
        return "'Amiri Quran', serif";
    }
  };

  const handleCopy = () => {
    const fullText = `﴿${target.text}﴾\n[سورة ${target.surahName} - الآية ${target.numberInSurah}]\n\nالتفسير الميسر:\n${tafseerText || '...'}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white border-b border-emerald-900/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base font-['Amiri',serif]">
                  سورة {target.surahName}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-200 font-sans font-bold">
                  الآية {target.numberInSurah}
                </span>
              </div>
              <p className="text-[10px] text-emerald-100/90 font-sans">
                التفسير الميسر (مجمع الملك فهد)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="إغلاق نافذة التفسير"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Ayah Display Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-950/60 border border-amber-200/80 dark:border-amber-900/40 shadow-xs relative">
            <div className="text-right">
              <span
                style={{
                  fontFamily: getFontFamily(font),
                  fontSize: '20px',
                  lineHeight: 2.1,
                }}
                className="text-stone-900 dark:text-stone-100 font-normal"
              >
                ﴿{target.text}﴾
              </span>
              <span className="inline-flex items-center justify-center mx-1 text-emerald-700 dark:text-amber-400 font-sans text-xs font-bold select-none">
                ({target.numberInSurah})
              </span>
            </div>
          </div>

          {/* Tafseer Text Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>بيان المعنى والتفسير:</span>
            </div>

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-stone-500 dark:text-stone-400">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs">جاري استدعاء التفسير الميسر من خادم التفاسير...</span>
              </div>
            ) : (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/70">
                <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-['Cairo',sans-serif]">
                  {tafseerText || 'التفسير غير متوفر حالياً لهذه الآية الكريمة.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play Button */}
            {onPlayAyah && (
              <button
                onClick={() => {
                  onPlayAyah(target.surahNumber, target.numberInSurah, target.numberOfAyahs || 7);
                  onClose();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isCurrentlyPlaying
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
                title="استماع لهذه الآية"
              >
                {isCurrentlyPlaying ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>يتلو الآن</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>استماع</span>
                  </>
                )}
              </button>
            )}

            {/* Bookmark Button */}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(target)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isBookmarked
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                }`}
                title="حفظ في المفضلة"
              >
                <BookmarkIcon className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'محفوظة' : 'حفظ'}</span>
              </button>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 transition"
              title="نسخ الآية مع التفسير"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-300 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
