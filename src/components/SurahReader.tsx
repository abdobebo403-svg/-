import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bookmark as BookmarkIcon,
  Copy,
  BookOpen,
  Check,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  FileText,
  Book,
  Volume2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SurahDetail, Ayah, UserSettings, ArabicFont } from '../types';
import { SURAH_METADATA } from '../data/quranMetadata';
import { useLongPress } from '../hooks/useLongPress';
import { ConciseTafseerModal, ConciseTafseerTarget } from './ConciseTafseerModal';
import { TajweedText } from './TajweedText';

interface SurahReaderProps {
  surah: SurahDetail;
  onBack: () => void;
  onSelectSurah: (surahNumber: number) => void;
  onPlayAyah: (surahNumber: number, ayahNumber: number, totalAyahs: number) => void;
  currentPlayingAyah: number | null;
  isPlaying: boolean;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  isBookmarked: (ayahNumber: number) => boolean;
  onToggleBookmark: (ayah: Ayah) => void;
  onOpenSettings: () => void;
  targetAyah?: number;
  onOpenPageMode?: (pageNumber: number) => void;
  onOpenTajweedLegend?: () => void;
}

const VerseCard: React.FC<{
  ayah: Ayah;
  surah: SurahDetail;
  isCurrentlyPlaying: boolean;
  bookmarked: boolean;
  isCopied: boolean;
  settings: UserSettings;
  getFontFamily: (font: ArabicFont) => string;
  onPlayAyah: () => void;
  onToggleBookmark: () => void;
  onCopyAyah: () => void;
  onShowTafseer: () => void;
  registerRef: (el: HTMLElement | null) => void;
}> = ({
  ayah,
  surah,
  isCurrentlyPlaying,
  bookmarked,
  isCopied,
  settings,
  getFontFamily,
  onPlayAyah,
  onToggleBookmark,
  onCopyAyah,
  onShowTafseer,
  registerRef,
}) => {
  const longPressProps = useLongPress({
    onLongPress: onShowTafseer,
  });

  return (
    <div
      ref={registerRef}
      id={`ayah-card-${ayah.numberInSurah}`}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative ${
        isCurrentlyPlaying
          ? 'bg-amber-50/90 dark:bg-emerald-950/60 border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/50 shadow-md'
          : 'bg-white dark:bg-stone-900/80 border-stone-200 dark:border-stone-800/80 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-xs'
      }`}
    >
      {/* Ayah text with Long-press for concise tafseer */}
      <div
        {...longPressProps}
        style={{
          fontFamily: getFontFamily(settings.font),
          fontSize: `${settings.fontSize}px`,
          lineHeight: 2.1,
        }}
        className="text-justify font-normal text-stone-900 dark:text-stone-100 select-text cursor-pointer active:opacity-95"
        dir="rtl"
        title="اضغط مطولاً لعرض التفسير الميسر"
      >
        <TajweedText
          text={ayah.text}
          tajweedText={ayah.tajweedText}
          enabled={settings.tajweedEnabled}
        />
        <span className="inline-flex items-center justify-center mx-2 text-emerald-700 dark:text-amber-400 font-sans text-sm font-bold select-none">
          ﴿{ayah.numberInSurah}﴾
        </span>
      </div>

      {/* Actions Bar for each Ayah */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2 text-xs">
        <button
          id={`play-ayah-${ayah.numberInSurah}`}
          onClick={onPlayAyah}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
            isCurrentlyPlaying
              ? 'bg-amber-500 text-stone-950 font-bold shadow'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 hover:text-emerald-700'
          }`}
        >
          {isCurrentlyPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              <span>يتلو الآن</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>استماع</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Concise Tafseer Button */}
          <button
            onClick={onShowTafseer}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 border border-amber-200/50 dark:border-amber-800/50 transition font-medium"
            title="عرض التفسير الميسر للآية"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">التفسير</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={onToggleBookmark}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition flex items-center gap-1 ${
              bookmarked
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800'
                : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title={bookmarked ? 'إزالة العلامة المرجعية' : 'حفظ كعلامة مرجعية'}
          >
            <BookmarkIcon className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{bookmarked ? 'محفوظة' : 'حفظ'}</span>
          </button>

          {/* Copy Ayah */}
          <button
            onClick={onCopyAyah}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-1"
            title="نسخ نص الآية الكريمة"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 text-[11px] font-bold">تم</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">نسخ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MushafAyahSpan: React.FC<{
  ayah: Ayah;
  surah: SurahDetail;
  isCurrentlyPlaying: boolean;
  tajweedEnabled: boolean;
  onPlayAyah: () => void;
  onShowTafseer: () => void;
  registerRef: (el: HTMLElement | null) => void;
}> = ({
  ayah,
  surah,
  isCurrentlyPlaying,
  tajweedEnabled,
  onPlayAyah,
  onShowTafseer,
  registerRef,
}) => {
  const longPressProps = useLongPress({
    onLongPress: onShowTafseer,
    onClick: onPlayAyah,
  });

  return (
    <span
      ref={registerRef}
      {...longPressProps}
      className={`cursor-pointer transition-colors duration-150 px-1 rounded select-text ${
        isCurrentlyPlaying
          ? 'bg-amber-300 text-stone-950 font-bold dark:bg-amber-400 dark:text-stone-950'
          : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
      }`}
      title={`انقر للاستماع • اضغط مطولاً لعرض التفسير الميسر`}
    >
      <TajweedText
        text={ayah.text}
        tajweedText={ayah.tajweedText}
        enabled={tajweedEnabled}
      />
      <span className="inline-flex items-center justify-center mx-1.5 text-emerald-700 dark:text-amber-400 font-sans text-sm font-bold select-none">
        ﴿{ayah.numberInSurah}﴾
      </span>
    </span>
  );
};

export const SurahReader: React.FC<SurahReaderProps> = ({
  surah,
  onBack,
  onSelectSurah,
  onPlayAyah,
  currentPlayingAyah,
  isPlaying,
  settings,
  onUpdateSettings,
  isBookmarked,
  onToggleBookmark,
  onOpenSettings,
  targetAyah,
  onOpenPageMode,
  onOpenTajweedLegend,
}) => {
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [conciseTafseerTarget, setConciseTafseerTarget] = useState<ConciseTafseerTarget | null>(null);
  const ayahRefs = useRef<Record<number, HTMLElement | null>>({});

  const prevSurahMeta = surah.number > 1 ? SURAH_METADATA.find(s => s.number === surah.number - 1) : null;
  const nextSurahMeta = surah.number < 114 ? SURAH_METADATA.find(s => s.number === surah.number + 1) : null;

  // Auto-scroll to target Ayah or current playing Ayah
  useEffect(() => {
    const ayahToScroll = targetAyah || (settings.autoScroll ? currentPlayingAyah : null);
    if (ayahToScroll && ayahRefs.current[ayahToScroll]) {
      ayahRefs.current[ayahToScroll]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [targetAyah, currentPlayingAyah, settings.autoScroll]);

  const copyAyahText = (ayah: Ayah) => {
    const textToCopy = `﴿${ayah.text}﴾ [سورة ${surah.name} : الآية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedAyah(ayah.numberInSurah);
      setTimeout(() => setCopiedAyah(null), 2000);
    });
  };

  const getFontFamily = (font: ArabicFont) => {
    switch (font) {
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

  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'parchment':
        return 'bg-[#f6f2e9] text-stone-900';
      case 'dark':
        return 'bg-stone-950 text-stone-100';
      case 'light':
        return 'bg-white text-stone-900';
      case 'emerald':
      default:
        return 'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeClasses()} pb-32 transition-colors duration-200`}>
      {/* Sticky Reader Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Back button & Surah title */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              id="reader-back-btn"
              onClick={onBack}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              aria-label="العودة لقائمة السور"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold font-['Amiri',serif] text-emerald-800 dark:text-emerald-400 truncate">
                سورة {surah.name}
              </h2>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                <span>•</span>
                <span>{surah.numberOfAyahs} آية</span>
                <span>•</span>
                <span>الجزء {surah.startJuz}</span>
              </div>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mode Switch: Verses vs Pages vs Mushaf */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
              <button
                id="mode-pages-btn"
                onClick={() => {
                  onUpdateSettings({ readerMode: 'pages' });
                  if (onOpenPageMode) {
                    onOpenPageMode(surah.page);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  settings.readerMode === 'pages'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="عرض المصحف صفحة بصفحة (1-604)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>صفحات</span>
              </button>

              <button
                id="mode-verses-btn"
                onClick={() => onUpdateSettings({ readerMode: 'verses' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  settings.readerMode === 'verses'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="عرض الآيات منفصلة مع التفسير والخيارات"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">آيات</span>
              </button>

              <button
                id="mode-mushaf-btn"
                onClick={() => onUpdateSettings({ readerMode: 'mushaf' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  settings.readerMode === 'mushaf'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="عرض المصحف المستمر"
              >
                <Book className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مستمر</span>
              </button>
            </div>

            {/* Font Zoom Controls */}
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.max(18, settings.fontSize - 2) })}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              title="تصغير الخط"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.min(42, settings.fontSize + 2) })}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              title="تكبير الخط"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Tajweed Color Toggle */}
            <button
              id="reader-tajweed-toggle-btn"
              onClick={() => onUpdateSettings({ tajweedEnabled: !settings.tajweedEnabled })}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                settings.tajweedEnabled
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:text-stone-800'
              }`}
              title={settings.tajweedEnabled ? 'التجويد الملون مفعّل (انقر للتعطيل)' : 'تفعيل التجويد الملون'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">التجويد</span>
            </button>

            {/* Tajweed Legend trigger if enabled */}
            {settings.tajweedEnabled && onOpenTajweedLegend && (
              <button
                onClick={onOpenTajweedLegend}
                className="p-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-300/60 dark:border-amber-800/60 transition"
                title="دليل أحكام التجويد وألوانها"
                aria-label="دليل التجويد"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            )}

            {/* Settings Trigger */}
            <button
              id="reader-settings-btn"
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title="الإعدادات"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Surah Content Body */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* Surah Decorative Frame Banner */}
        <div className="text-center my-6 p-6 rounded-3xl bg-gradient-to-b from-emerald-900/10 to-transparent dark:from-emerald-950/40 border border-emerald-800/20 dark:border-emerald-700/30 relative overflow-hidden">
          <div className="inline-block px-6 py-2 rounded-2xl bg-emerald-700 text-amber-200 font-['Amiri',serif] text-2xl font-bold shadow-md">
            سورة {surah.name}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-['Cairo',sans-serif]">
            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • عدد آياتها {surah.numberOfAyahs} • ترتيبها {surah.number}
          </div>
        </div>

        {/* Bismillah Header (for all except At-Tawbah (9)) */}
        {surah.bismillahPre && (
          <div className="text-center my-6 py-4">
            <span
              style={{
                fontFamily: getFontFamily(settings.font),
                fontSize: `${Math.max(22, settings.fontSize + 2)}px`,
              }}
              className="text-emerald-900 dark:text-emerald-300 font-bold select-none drop-shadow-xs"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
          </div>
        )}

        {/* Tip Banner for Long Press Tafseer */}
        <div className="mb-6 p-2.5 rounded-xl bg-amber-50/80 dark:bg-stone-900/60 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-center gap-2 text-xs text-stone-600 dark:text-stone-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>اضغط مطولاً على نص أي آية لعرض تفسيرها الميسر فوراً</span>
        </div>

        {/* MODE 1: VERSES (آيات منفصلة مع التفسير والتحكم الكامل) */}
        {settings.readerMode === 'verses' && (
          <div className="space-y-4">
            {surah.ayahs.map((ayah) => {
              const isCurrentlyPlaying = currentPlayingAyah === ayah.numberInSurah && isPlaying;
              const bookmarked = isBookmarked(ayah.numberInSurah);

              return (
                <VerseCard
                  key={ayah.numberInSurah}
                  ayah={ayah}
                  surah={surah}
                  isCurrentlyPlaying={isCurrentlyPlaying}
                  bookmarked={bookmarked}
                  isCopied={copiedAyah === ayah.numberInSurah}
                  settings={settings}
                  getFontFamily={getFontFamily}
                  onPlayAyah={() =>
                    onPlayAyah(surah.number, ayah.numberInSurah, surah.numberOfAyahs)
                  }
                  onToggleBookmark={() => onToggleBookmark(ayah)}
                  onCopyAyah={() => copyAyahText(ayah)}
                  onShowTafseer={() =>
                    setConciseTafseerTarget({
                      surahNumber: surah.number,
                      surahName: surah.name,
                      numberInSurah: ayah.numberInSurah,
                      text: ayah.text,
                      tafseer: ayah.tafseer,
                      numberOfAyahs: surah.numberOfAyahs,
                    })
                  }
                  registerRef={(el) => {
                    ayahRefs.current[ayah.numberInSurah] = el;
                  }}
                />
              );
            })}
          </div>
        )}

        {/* MODE 2: MUSHAF FLOW (عرض المصحف الموصول) */}
        {settings.readerMode === 'mushaf' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 shadow-lg relative">
            <div
              style={{
                fontFamily: getFontFamily(settings.font),
                fontSize: `${settings.fontSize}px`,
                lineHeight: 2.3,
                textAlign: 'justify',
              }}
              className="text-stone-900 dark:text-stone-100 select-text"
              dir="rtl"
            >
              {surah.ayahs.map((ayah) => {
                const isCurrentlyPlaying = currentPlayingAyah === ayah.numberInSurah && isPlaying;
                return (
                  <MushafAyahSpan
                    key={ayah.numberInSurah}
                    ayah={ayah}
                    surah={surah}
                    isCurrentlyPlaying={isCurrentlyPlaying}
                    onPlayAyah={() =>
                      onPlayAyah(surah.number, ayah.numberInSurah, surah.numberOfAyahs)
                    }
                    onShowTafseer={() =>
                      setConciseTafseerTarget({
                        surahNumber: surah.number,
                        surahName: surah.name,
                        numberInSurah: ayah.numberInSurah,
                        text: ayah.text,
                        tafseer: ayah.tafseer,
                        numberOfAyahs: surah.numberOfAyahs,
                      })
                    }
                    registerRef={(el) => {
                      ayahRefs.current[ayah.numberInSurah] = el;
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Surah Navigation (Previous / Next Surah) */}
        <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          {prevSurahMeta ? (
            <button
              onClick={() => onSelectSurah(prevSurahMeta.number)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold shadow-xs transition"
            >
              <ChevronRight className="w-4 h-4" />
              <div>
                <span className="text-[10px] text-stone-400 block font-normal">السورة السابقة</span>
                <span>سورة {prevSurahMeta.name}</span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextSurahMeta ? (
            <button
              onClick={() => onSelectSurah(nextSurahMeta.number)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold shadow-xs transition text-left"
            >
              <div>
                <span className="text-[10px] text-stone-400 block font-normal">السورة التالية</span>
                <span>سورة {nextSurahMeta.name}</span>
              </div>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}
        </div>
      </main>

      {/* Concise Tafseer Modal triggered on long-press */}
      <ConciseTafseerModal
        target={conciseTafseerTarget}
        onClose={() => setConciseTafseerTarget(null)}
        onPlayAyah={onPlayAyah}
        isCurrentlyPlaying={
          conciseTafseerTarget
            ? currentPlayingAyah === conciseTafseerTarget.numberInSurah && isPlaying
            : false
        }
        onToggleBookmark={(t) => {
          const ayah = surah.ayahs.find((a) => a.numberInSurah === t.numberInSurah);
          if (ayah) onToggleBookmark(ayah);
        }}
        isBookmarked={
          conciseTafseerTarget ? isBookmarked(conciseTafseerTarget.numberInSurah) : false
        }
        font={settings.font}
      />
    </div>
  );
};
