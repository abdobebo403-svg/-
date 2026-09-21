import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
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
  X,
  Compass,
  ArrowUpDown,
  Sparkles,
  Hand,
} from 'lucide-react';
import { QuranPageData, PageAyah, UserSettings, ArabicFont, Bookmark } from '../types';
import { fetchQuranPage } from '../services/quranApi';
import { SURAH_METADATA } from '../data/quranMetadata';
import { getPrimarySurahForPage } from '../data/pageMetadata';
import { useLongPress } from '../hooks/useLongPress';
import { ConciseTafseerModal, ConciseTafseerTarget } from './ConciseTafseerModal';
import { TajweedText } from './TajweedText';

interface PageReaderProps {
  initialPageNumber: number;
  onBack: () => void;
  onSelectSurah?: (surahNumber: number) => void;
  onPlayAyah: (surahNumber: number, ayahNumber: number, totalAyahs: number) => void;
  currentPlayingAyah: number | null;
  currentPlayingSurah: number | null;
  isPlaying: boolean;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  onToggleBookmark: (bookmark: Bookmark) => void;
  onOpenSettings: () => void;
  onOpenTajweedLegend?: () => void;
}

export const PageReader: React.FC<PageReaderProps> = ({
  initialPageNumber,
  onBack,
  onSelectSurah,
  onPlayAyah,
  currentPlayingAyah,
  currentPlayingSurah,
  isPlaying,
  settings,
  onUpdateSettings,
  isBookmarked,
  onToggleBookmark,
  onOpenSettings,
  onOpenTajweedLegend,
}) => {
  const [currentPageNumber, setCurrentPageNumber] = useState(
    Math.max(1, Math.min(604, initialPageNumber || 1))
  );
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageTurnDirection, setPageTurnDirection] = useState<'next' | 'prev'>('next');
  const [swipeFeedback, setSwipeFeedback] = useState<{ text: string; dir: 'next' | 'prev' } | null>(null);

  // Selected ayah for modal/popover (Tafseer, Bookmark, Audio)
  const [selectedAyah, setSelectedAyah] = useState<PageAyah | null>(null);
  const [conciseTafseerTarget, setConciseTafseerTarget] = useState<ConciseTafseerTarget | null>(null);
  const [copiedAyahNum, setCopiedAyahNum] = useState<number | null>(null);

  // Page Jump Dialog
  const [isJumpDialogOpen, setIsJumpDialogOpen] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState<string>(String(currentPageNumber));

  // Touch and drag swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const hasSwipedRef = useRef(false);

  // Desktop mouse drag refs
  const mouseStartX = useRef<number | null>(null);
  const mouseStartY = useRef<number | null>(null);
  const isMouseDown = useRef(false);

  // Load page data whenever currentPageNumber changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setSelectedAyah(null);

    fetchQuranPage(currentPageNumber)
      .then((data) => {
        if (!isCancelled) {
          setPageData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Page load error:', err);
          setLoadError(err.message || 'تعذر تحميل الصفحة');
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentPageNumber]);

  // If audio is playing an ayah that belongs to another page, auto-turn to that page!
  useEffect(() => {
    if (isPlaying && currentPlayingSurah && currentPlayingAyah && pageData) {
      const isAyahOnCurrentPage = pageData.ayahs.some(
        (a) => a.surahNumber === currentPlayingSurah && a.numberInSurah === currentPlayingAyah
      );

      if (!isAyahOnCurrentPage && settings.autoScroll) {
        // Find if this ayah is on next page
        const surahMeta = SURAH_METADATA.find((s) => s.number === currentPlayingSurah);
        if (surahMeta) {
          // Check next page if within bounds
          if (currentPageNumber < 604) {
            fetchQuranPage(currentPageNumber + 1).then((nextPage) => {
              const onNext = nextPage.ayahs.some(
                (a) => a.surahNumber === currentPlayingSurah && a.numberInSurah === currentPlayingAyah
              );
              if (onNext) {
                setPageTurnDirection('next');
                setCurrentPageNumber(currentPageNumber + 1);
              }
            });
          }
        }
      }
    }
  }, [currentPlayingSurah, currentPlayingAyah, isPlaying, pageData, currentPageNumber, settings.autoScroll]);

  const showFeedback = (dir: 'next' | 'prev', targetPage: number) => {
    setSwipeFeedback({
      text: dir === 'next' ? `الصفحة التالية (${targetPage})` : `الصفحة السابقة (${targetPage})`,
      dir,
    });
    setTimeout(() => {
      setSwipeFeedback(null);
    }, 850);
  };

  const goToNextPage = () => {
    if (currentPageNumber < 604) {
      const target = currentPageNumber + 1;
      setPageTurnDirection('next');
      showFeedback('next', target);
      setCurrentPageNumber(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPageNumber > 1) {
      const target = currentPageNumber - 1;
      setPageTurnDirection('prev');
      showFeedback('prev', target);
      setCurrentPageNumber(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation (ArrowRight -> Next Page, ArrowLeft -> Prev Page)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageNumber]);

  // Touch handlers for mobile swipe navigation
  // Specifically: Swiping to the right (السحب لليمين) flips to the next page!
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
    hasSwipedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;

    if (touchStartX.current !== null) {
      const deltaX = touchEndX.current - touchStartX.current;
      if (Math.abs(deltaX) > 15) {
        hasSwipedRef.current = true;
      }
    }
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null ||
      touchStartY.current === null ||
      touchEndY.current === null
    ) {
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;

    // Minimum swipe threshold 40px, ensuring horizontal movement is dominant over vertical scrolling
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 0.85) {
      if (deltaX > 0) {
        // Swiped towards the right (السحب لليمين) -> تقليب للصفحة التالية
        goToNextPage();
      } else {
        // Swiped towards the left (السحب لليسار) -> الرجوع للصفحة السابقة
        goToPrevPage();
      }
    }

    // Keep hasSwiped true momentarily to prevent accidental ayah clicks immediately after a swipe gesture
    setTimeout(() => {
      hasSwipedRef.current = false;
    }, 180);

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  // Mouse drag handlers for desktop/laptop users
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, [role="button"]')) return;
    mouseStartX.current = e.clientX;
    mouseStartY.current = e.clientY;
    isMouseDown.current = true;
    hasSwipedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null) return;
    const deltaX = e.clientX - mouseStartX.current;
    if (Math.abs(deltaX) > 15) {
      hasSwipedRef.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current || mouseStartX.current === null || mouseStartY.current === null) return;
    isMouseDown.current = false;
    const deltaX = e.clientX - mouseStartX.current;
    const deltaY = e.clientY - mouseStartY.current;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        // Mouse dragged to the right -> تقليب للصفحة التالية
        goToNextPage();
      } else {
        // Mouse dragged to the left -> الصفحة السابقة
        goToPrevPage();
      }
    }

    setTimeout(() => {
      hasSwipedRef.current = false;
    }, 180);

    mouseStartX.current = null;
    mouseStartY.current = null;
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= 604) {
      setCurrentPageNumber(target);
      setIsJumpDialogOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyAyah = (ayah: PageAyah) => {
    const textToCopy = `﴿${ayah.text}﴾ [سورة ${ayah.surahName} : الآية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedAyahNum(ayah.number);
      setTimeout(() => setCopiedAyahNum(null), 2000);
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

  const primarySurah = pageData?.surahsOnPage[0] || getPrimarySurahForPage(currentPageNumber);

  return (
    <div
      className="min-h-screen pb-32 transition-colors duration-200 relative select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Swipe Feedback Toast */}
      <AnimatePresence>
        {swipeFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.16 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-700 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-emerald-500/50 pointer-events-none"
          >
            {swipeFeedback.dir === 'next' ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
            <span>{swipeFeedback.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Side Quick-Turn Page Buttons for Desktop & Tablet */}
      <button
        onClick={goToNextPage}
        disabled={currentPageNumber >= 604}
        className="hidden md:flex fixed right-3 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-md items-center justify-center transition disabled:opacity-20 disabled:pointer-events-none group"
        title="الصفحة التالية (أو اسحب لليمين ⟶)"
      >
        <ChevronRight className="w-5 h-5 group-hover:scale-115 transition-transform" />
      </button>

      <button
        onClick={goToPrevPage}
        disabled={currentPageNumber <= 1}
        className="hidden md:flex fixed left-3 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-md items-center justify-center transition disabled:opacity-20 disabled:pointer-events-none group"
        title="الصفحة السابقة (أو اسحب لليسار ⟵)"
      >
        <ChevronLeft className="w-5 h-5 group-hover:scale-115 transition-transform" />
      </button>

      {/* Top Header Controls Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Back & Page Title */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              id="page-reader-back-btn"
              onClick={onBack}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              aria-label="العودة"
              title="العودة للقائمة"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Amiri',serif] text-emerald-800 dark:text-emerald-400 truncate">
                  سورة {primarySurah?.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                  صفحة {currentPageNumber}
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <span>الجزء {pageData?.juz || 1}</span>
                <span>•</span>
                <span>المصحف الشريف</span>
              </div>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mode Switch: Verses vs Pages vs Mushaf */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
              <button
                id="mode-pages-active-btn"
                onClick={() => onUpdateSettings({ readerMode: 'pages' })}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold shadow-xs transition"
                title="عرض المصحف صفحة بصفحة"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>صفحات</span>
              </button>

              <button
                id="mode-verses-btn"
                onClick={() => {
                  onUpdateSettings({ readerMode: 'verses' });
                  if (primarySurah && onSelectSurah) {
                    onSelectSurah(primarySurah.number);
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 transition"
                title="عرض الآيات منفصلة"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">آيات</span>
              </button>

              <button
                id="mode-mushaf-btn"
                onClick={() => {
                  onUpdateSettings({ readerMode: 'mushaf' });
                  if (primarySurah && onSelectSurah) {
                    onSelectSurah(primarySurah.number);
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 transition"
                title="عرض المصحف المستمر"
              >
                <Book className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مستمر</span>
              </button>
            </div>

            {/* Jump to Page Dialog Trigger */}
            <button
              id="jump-to-page-btn"
              onClick={() => {
                setJumpPageInput(String(currentPageNumber));
                setIsJumpDialogOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300/60 dark:border-amber-800/60 text-xs font-bold transition flex items-center gap-1"
              title="انتقال إلى صفحة أخرى"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">انتقال</span>
            </button>

            {/* Font Zoom */}
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.max(18, settings.fontSize - 2) })}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title="تصغير الخط"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.min(40, settings.fontSize + 2) })}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title="تكبير الخط"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Tajweed Color Toggle */}
            <button
              id="page-tajweed-toggle-btn"
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
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title="الإعدادات"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Canvas / Frame */}
      <main className="max-w-3xl mx-auto px-2 sm:px-4 pt-4 sm:pt-6">
        {/* Loading Spinner */}
        {isLoading && !pageData && (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
              جاري فتح الصفحة {currentPageNumber}...
            </p>
          </div>
        )}

        {/* Load Error */}
        {loadError && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center my-8">
            <p className="text-sm font-bold text-rose-800 dark:text-rose-300 mb-2">{loadError}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                setLoadError(null);
                fetchQuranPage(currentPageNumber).then(setPageData).finally(() => setIsLoading(false));
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Gesture Tip / Guide */}
        <div className="mb-3.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Hand className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>اسحب لليمين للتقليب (⟶) • اضغط مطولاً على أي آية للتفسير الميسر</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-stone-500 dark:text-stone-400">
            أو عبر مفاتيح الأسهم
          </span>
        </div>

        {/* Page Container Styled as Authentic Medina Mushaf */}
        <AnimatePresence mode="wait" initial={false}>
          {pageData && (
            <motion.div
              key={currentPageNumber}
              initial={{
                opacity: 0.7,
                x: pageTurnDirection === 'next' ? 35 : -35,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0.7,
                x: pageTurnDirection === 'next' ? -35 : 35,
              }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              id={`quran-page-${currentPageNumber}`}
              className="rounded-3xl bg-white dark:bg-stone-900 border-2 sm:border-4 border-amber-600/30 dark:border-amber-700/30 shadow-xl overflow-hidden relative cursor-grab active:cursor-grabbing"
            >
              {/* Islamic Decorative Corners */}
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />

              {/* Page Top Header Bar (ترويسة الصفحة) */}
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-amber-600/20 dark:border-amber-700/20 text-xs font-bold text-amber-900 dark:text-amber-400 bg-amber-50/40 dark:bg-stone-950/40">
                <span className="font-['Amiri',serif] text-sm">
                  سورة {primarySurah?.name}
                </span>
                <span className="font-['Amiri',serif] text-sm text-stone-600 dark:text-stone-400">
                  الجزء {pageData.juz}
                </span>
              </div>

              {/* Page Content Body */}
              <div className="p-4 sm:p-7 sm:px-9 min-h-[580px] flex flex-col justify-between">
                <div>
                  {/* Group and render ayahs, injecting Surah banners when a Surah begins */}
                  {renderPageAyahsWithBanners({
                    pageData,
                    settings,
                    currentPlayingAyah,
                    currentPlayingSurah,
                    isPlaying,
                    isBookmarked,
                    onAyahClick: (ayah) => {
                      if (hasSwipedRef.current) return;
                      setSelectedAyah(ayah);
                    },
                    onAyahLongPress: (ayah) => {
                      if (hasSwipedRef.current) return;
                      setConciseTafseerTarget({
                        surahNumber: ayah.surahNumber,
                        surahName: ayah.surahName,
                        numberInSurah: ayah.numberInSurah,
                        text: ayah.text,
                        tafseer: ayah.tafseer,
                        numberOfAyahs: ayah.numberOfAyahs,
                      });
                    },
                    getFontFamily,
                  })}
                </div>

                {/* Page Bottom Footer Bar with Page Number */}
                <div className="pt-6 mt-6 border-t border-amber-600/20 dark:border-amber-700/20 text-center">
                  <span className="inline-block px-4 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs tracking-wider border border-stone-200 dark:border-stone-700">
                    — {currentPageNumber} —
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Page Navigation Controls */}
        <div className="mt-5 flex items-center justify-between gap-2">
          {/* Next Page Button (in Arabic reading, Next page is to the left / forward) */}
          <button
            id="page-prev-btn"
            disabled={currentPageNumber <= 1}
            onClick={goToPrevPage}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition shadow-xs border ${
              currentPageNumber <= 1
                ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700'
                : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-emerald-500'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            <span>الصفحة السابقة ({currentPageNumber - 1})</span>
          </button>

          {/* Quick Page Jump Button */}
          <button
            onClick={() => {
              setJumpPageInput(String(currentPageNumber));
              setIsJumpDialogOpen(true);
            }}
            className="px-3.5 py-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-400/40 text-xs font-bold hover:bg-amber-500/20 transition flex items-center gap-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{currentPageNumber} / 604</span>
          </button>

          {/* Next Page */}
          <button
            id="page-next-btn"
            disabled={currentPageNumber >= 604}
            onClick={goToNextPage}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition shadow-xs border ${
              currentPageNumber >= 604
                ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700'
                : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-emerald-500'
            }`}
          >
            <span>الصفحة التالية ({currentPageNumber + 1})</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Selected Ayah Action Sheet / Popover */}
      {selectedAyah && (
        <div className="fixed inset-x-0 bottom-24 z-40 px-3 sm:px-4 flex justify-center animate-in slide-in-from-bottom-5 duration-200 pointer-events-none">
          <div className="w-full max-w-lg bg-stone-900/95 text-white dark:bg-stone-950/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-stone-700 flex flex-col gap-2.5 pointer-events-auto">
            {/* Header with Ayah Reference */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                  {selectedAyah.numberInSurah}
                </span>
                <span className="text-xs font-bold text-stone-200">
                  سورة {selectedAyah.surahName} : الآية {selectedAyah.numberInSurah}
                </span>
              </div>
              <button
                onClick={() => setSelectedAyah(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ayah Snippet preview */}
            <p className="text-xs text-stone-300 font-['Amiri_Quran',serif] line-clamp-2 px-1 text-right" dir="rtl">
              <TajweedText
                text={selectedAyah.text}
                tajweedText={selectedAyah.tajweedText}
                enabled={settings.tajweedEnabled}
              />
            </p>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-xs">
              {/* Play Audio */}
              <button
                id="selected-ayah-play-btn"
                onClick={() => {
                  onPlayAyah(
                    selectedAyah.surahNumber,
                    selectedAyah.numberInSurah,
                    selectedAyah.numberOfAyahs
                  );
                }}
                className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>استماع</span>
              </button>

              {/* Show Tafseer */}
              <button
                onClick={() => {
                  setConciseTafseerTarget({
                    surahNumber: selectedAyah.surahNumber,
                    surahName: selectedAyah.surahName,
                    numberInSurah: selectedAyah.numberInSurah,
                    text: selectedAyah.text,
                    tafseer: selectedAyah.tafseer,
                    numberOfAyahs: selectedAyah.numberOfAyahs,
                  });
                }}
                className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>التفسير</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={() => {
                  onToggleBookmark({
                    surahNumber: selectedAyah.surahNumber,
                    surahName: selectedAyah.surahName,
                    ayahNumber: selectedAyah.numberInSurah,
                    date: new Date().toLocaleDateString('ar-EG'),
                    previewText: selectedAyah.text.slice(0, 70),
                  });
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold transition ${
                  isBookmarked(selectedAyah.surahNumber, selectedAyah.numberInSurah)
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                }`}
              >
                <BookmarkIcon className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isBookmarked(selectedAyah.surahNumber, selectedAyah.numberInSurah)
                    ? 'محفوظة'
                    : 'حفظ'}
                </span>
              </button>

              {/* Copy */}
              <button
                onClick={() => handleCopyAyah(selectedAyah)}
                className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition"
              >
                {copiedAyahNum === selectedAyah.number ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concise Tafseer Modal */}
      <ConciseTafseerModal
        target={conciseTafseerTarget}
        onClose={() => setConciseTafseerTarget(null)}
        onPlayAyah={onPlayAyah}
        isCurrentlyPlaying={
          conciseTafseerTarget
            ? currentPlayingSurah === conciseTafseerTarget.surahNumber &&
              currentPlayingAyah === conciseTafseerTarget.numberInSurah &&
              isPlaying
            : false
        }
        onToggleBookmark={(t) => {
          onToggleBookmark({
            surahNumber: t.surahNumber,
            surahName: t.surahName,
            ayahNumber: t.numberInSurah,
            date: new Date().toLocaleDateString('ar-EG'),
            previewText: t.text.slice(0, 70),
          });
        }}
        isBookmarked={
          conciseTafseerTarget
            ? isBookmarked(conciseTafseerTarget.surahNumber, conciseTafseerTarget.numberInSurah)
            : false
        }
        font={settings.font}
      />

      {/* Jump to Page Dialog */}
      {isJumpDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-center">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Compass className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
              انتقال سريع لصفحة
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              أدخل رقم الصفحة من 1 إلى 604
            </p>

            <form onSubmit={handleJumpSubmit} className="space-y-3">
              <input
                type="number"
                min={1}
                max={604}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                autoFocus
                className="w-full text-center py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-lg font-bold text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Slider for quick browsing */}
              <input
                type="range"
                min={1}
                max={604}
                value={parseInt(jumpPageInput, 10) || 1}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJumpDialogOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  انتقال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: Renders the continuous page ayahs and injects authentic Surah banners when a surah begins on this page
interface RenderParams {
  pageData: QuranPageData;
  settings: UserSettings;
  currentPlayingAyah: number | null;
  currentPlayingSurah: number | null;
  isPlaying: boolean;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  onAyahClick: (ayah: PageAyah) => void;
  onAyahLongPress: (ayah: PageAyah) => void;
  getFontFamily: (font: ArabicFont) => string;
}

const PageAyahSpan: React.FC<{
  ayah: PageAyah;
  isCurrentlyPlaying: boolean;
  bookmarked: boolean;
  tajweedEnabled: boolean;
  onAyahClick: (ayah: PageAyah) => void;
  onAyahLongPress: (ayah: PageAyah) => void;
}> = ({ ayah, isCurrentlyPlaying, bookmarked, tajweedEnabled, onAyahClick, onAyahLongPress }) => {
  const longPressProps = useLongPress({
    onLongPress: () => onAyahLongPress(ayah),
    onClick: () => onAyahClick(ayah),
  });

  return (
    <span
      {...longPressProps}
      className={`cursor-pointer transition-colors duration-150 px-1 py-0.5 rounded inline ${
        isCurrentlyPlaying
          ? 'bg-amber-300 dark:bg-amber-400 text-stone-950 font-bold shadow-xs'
          : bookmarked
          ? 'bg-amber-100/70 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100 border-b border-amber-400'
          : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
      }`}
      title={`سورة ${ayah.surahName} آية ${ayah.numberInSurah} • انقر للخيارات • اضغط مطولاً لعرض التفسير الميسر`}
    >
      <TajweedText
        text={ayah.text}
        tajweedText={ayah.tajweedText}
        enabled={tajweedEnabled}
      />
      {/* Decorative Ayah Ending Mark */}
      <span className="inline-flex items-center justify-center mx-1 text-emerald-700 dark:text-amber-400 font-sans text-xs sm:text-sm font-bold select-none">
        ﴿{ayah.numberInSurah}﴾
      </span>
    </span>
  );
};

function renderPageAyahsWithBanners({
  pageData,
  settings,
  currentPlayingAyah,
  currentPlayingSurah,
  isPlaying,
  isBookmarked,
  onAyahClick,
  onAyahLongPress,
  getFontFamily,
}: RenderParams) {
  // Group ayahs by surah sections on this page
  const segments: {
    surahNumber: number;
    surahName: string;
    isStartOfSurah: boolean;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: PageAyah[];
  }[] = [];

  for (const ayah of pageData.ayahs) {
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && lastSeg.surahNumber === ayah.surahNumber) {
      lastSeg.ayahs.push(ayah);
    } else {
      segments.push({
        surahNumber: ayah.surahNumber,
        surahName: ayah.surahName,
        isStartOfSurah: ayah.numberInSurah === 1,
        revelationType: ayah.revelationType,
        numberOfAyahs: ayah.numberOfAyahs,
        ayahs: [ayah],
      });
    }
  }

  return (
    <div className="space-y-6">
      {segments.map((seg, sIdx) => {
        return (
          <div key={`${seg.surahNumber}-${sIdx}`} className="space-y-3">
            {/* Surah Decorative Medina Frame Banner when Surah starts on this page */}
            {seg.isStartOfSurah && (
              <div className="my-4 text-center">
                {/* Traditional Medina Mushaf Header Frame */}
                <div className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-amber-200 border-2 border-amber-400/70 shadow-md inline-block max-w-full">
                  <h3 className="font-['Amiri',serif] text-xl sm:text-2xl font-bold tracking-wide">
                    سُورَةُ {seg.surahName}
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-sans mt-0.5">
                    {seg.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • آياتها {seg.numberOfAyahs}
                  </p>
                </div>

                {/* Centered Bismillah (for all except At-Tawbah 9) */}
                {seg.surahNumber !== 9 && (
                  <div className="mt-3.5 mb-2">
                    <span
                      style={{
                        fontFamily: getFontFamily(settings.font),
                        fontSize: `${Math.max(22, settings.fontSize + 2)}px`,
                      }}
                      className="text-emerald-950 dark:text-emerald-300 font-bold select-none drop-shadow-xs"
                    >
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Continuous Ayahs Flow on the Page */}
            <div
              style={{
                fontFamily: getFontFamily(settings.font),
                fontSize: `${settings.fontSize}px`,
                lineHeight: 2.25,
                textAlign: 'justify',
              }}
              className="text-stone-900 dark:text-stone-100 select-text"
              dir="rtl"
            >
              {seg.ayahs.map((ayah) => {
                const isCurrentlyPlaying =
                  currentPlayingSurah === ayah.surahNumber &&
                  currentPlayingAyah === ayah.numberInSurah &&
                  isPlaying;
                const bookmarked = isBookmarked(ayah.surahNumber, ayah.numberInSurah);

                return (
                  <PageAyahSpan
                    key={`${ayah.surahNumber}-${ayah.numberInSurah}`}
                    ayah={ayah}
                    isCurrentlyPlaying={isCurrentlyPlaying}
                    bookmarked={bookmarked}
                    tajweedEnabled={settings.tajweedEnabled}
                    onAyahClick={onAyahClick}
                    onAyahLongPress={onAyahLongPress}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
