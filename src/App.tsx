import React, { useState, useEffect } from 'react';
import { SurahDetail, UserSettings, Bookmark, Ayah } from './types';
import { fetchSurahDetail } from './services/quranApi';
import { SURAH_METADATA } from './data/quranMetadata';
import { RECITERS } from './data/reciters';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { SurahList } from './components/SurahList';
import { SurahReader } from './components/SurahReader';
import { PageReader } from './components/PageReader';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { SettingsModal } from './components/SettingsModal';
import { DuaModal } from './components/DuaModal';
import { TajweedLegendModal } from './components/TajweedLegendModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Loader2, Sparkles, SlidersHorizontal, BookOpen, AlertCircle, WifiOff } from 'lucide-react';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'emerald',
  font: 'amiri-quran',
  fontSize: 26,
  readerMode: 'verses',
  selectedReciterId: 'alafasy',
  autoScroll: true,
  playbackSpeed: 1,
  tajweedEnabled: true,
};

export default function App() {
  const [currentSurah, setCurrentSurah] = useState<SurahDetail | null>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState<number | null>(null);
  const [targetAyah, setTargetAyah] = useState<number | undefined>(undefined);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [surahError, setSurahError] = useState<string | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDuaOpen, setIsDuaOpen] = useState(false);
  const [isTajweedLegendOpen, setIsTajweedLegendOpen] = useState(false);

  // Settings state persisted in localStorage
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('quran_settings_v1');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Bookmarks state persisted in localStorage
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('quran_bookmarks_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Last read state persisted in localStorage
  const [lastRead, setLastRead] = useState<Bookmark | null>(() => {
    try {
      const saved = localStorage.getItem('quran_last_read_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update theme class on HTML / body
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-emerald', 'theme-parchment', 'theme-dark', 'theme-light');
    root.classList.add(`theme-${settings.theme}`);

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('quran_settings_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage write error:', e);
      }
      return updated;
    });

    // If reciter was updated in settings, sync with audio player
    if (newSettings.selectedReciterId) {
      const r = RECITERS.find((rec) => rec.id === newSettings.selectedReciterId);
      if (r) {
        audioPlayer.setReciter(r);
      }
    }
  };

  // Audio Player Hook
  const audioPlayer = useAudioPlayer();

  // Load Surah detail
  const handleSelectSurah = async (surahNumber: number, startAyah?: number) => {
    const meta = SURAH_METADATA.find((s) => s.number === surahNumber);
    if (settings.readerMode === 'pages' && meta) {
      setCurrentSurah(null);
      setCurrentPageNumber(meta.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Save as last read
      const lr: Bookmark = {
        surahNumber: meta.number,
        surahName: meta.name,
        ayahNumber: startAyah || 1,
        date: new Date().toLocaleDateString('ar-EG'),
        previewText: `صفحة ${meta.page} - سورة ${meta.name}`,
      };
      setLastRead(lr);
      try {
        localStorage.setItem('quran_last_read_v1', JSON.stringify(lr));
      } catch (_) {}
      return;
    }

    setIsLoadingSurah(true);
    setSurahError(null);
    setTargetAyah(startAyah);

    try {
      const detail = await fetchSurahDetail(surahNumber);
      setCurrentSurah(detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Save as last read
      const meta = SURAH_METADATA.find((s) => s.number === surahNumber);
      if (meta) {
        const lr: Bookmark = {
          surahNumber: meta.number,
          surahName: meta.name,
          ayahNumber: startAyah || 1,
          date: new Date().toLocaleDateString('ar-EG'),
          previewText: detail.ayahs[0]?.text.slice(0, 60),
        };
        setLastRead(lr);
        try {
          localStorage.setItem('quran_last_read_v1', JSON.stringify(lr));
        } catch (_) {}
      }
    } catch (err: any) {
      console.error('Error loading surah:', err);
      setSurahError(err.message || 'تعذر تحميل السورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoadingSurah(false);
    }
  };

  // Handle direct Play Surah from Home list
  const handlePlaySurahFromList = (surahNumber: number) => {
    const meta = SURAH_METADATA.find((s) => s.number === surahNumber);
    if (!meta) return;

    if (audioPlayer.currentSurahNumber === surahNumber && audioPlayer.isPlaying) {
      audioPlayer.togglePlay();
    } else {
      audioPlayer.playAyah(surahNumber, 1, meta.numberOfAyahs);
    }
  };

  // Bookmark Toggle
  const isAyahBookmarked = (ayahNumber: number): boolean => {
    if (!currentSurah) return false;
    return bookmarks.some(
      (b) => b.surahNumber === currentSurah.number && b.ayahNumber === ayahNumber
    );
  };

  const handleToggleBookmark = (ayah: Ayah) => {
    if (!currentSurah) return;
    const exists = isAyahBookmarked(ayah.numberInSurah);

    let nextBookmarks: Bookmark[];
    if (exists) {
      nextBookmarks = bookmarks.filter(
        (b) => !(b.surahNumber === currentSurah.number && b.ayahNumber === ayah.numberInSurah)
      );
    } else {
      const newBm: Bookmark = {
        surahNumber: currentSurah.number,
        surahName: currentSurah.name,
        ayahNumber: ayah.numberInSurah,
        date: new Date().toLocaleDateString('ar-EG'),
        previewText: ayah.text.slice(0, 70),
      };
      nextBookmarks = [newBm, ...bookmarks];
    }

    setBookmarks(nextBookmarks);
    try {
      localStorage.setItem('quran_bookmarks_v1', JSON.stringify(nextBookmarks));
    } catch (e) {
      console.warn('Bookmarks save error:', e);
    }
  };

  const handleRemoveBookmark = (surahNumber: number, ayahNumber: number) => {
    const nextBookmarks = bookmarks.filter(
      (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
    );
    setBookmarks(nextBookmarks);
    try {
      localStorage.setItem('quran_bookmarks_v1', JSON.stringify(nextBookmarks));
    } catch (_) {}
  };

  const handleTogglePageBookmark = (bookmark: Bookmark) => {
    const exists = bookmarks.some(
      (b) => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
    );
    let nextBookmarks: Bookmark[];
    if (exists) {
      nextBookmarks = bookmarks.filter(
        (b) => !(b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber)
      );
    } else {
      nextBookmarks = [bookmark, ...bookmarks];
    }
    setBookmarks(nextBookmarks);
    try {
      localStorage.setItem('quran_bookmarks_v1', JSON.stringify(nextBookmarks));
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Offline Alert Badge */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 sticky top-0 z-50 shadow">
          <WifiOff className="w-3.5 h-3.5" />
          <span>أنت الآن في وضع عدم الاتصال - يمكنك قراءة السور المحفوظة دون إنترنت</span>
        </div>
      )}

      {/* Main Content Area */}
      {currentPageNumber !== null ? (
        <PageReader
          initialPageNumber={currentPageNumber}
          onBack={() => {
            setCurrentPageNumber(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectSurah={(num) => {
            setCurrentPageNumber(null);
            handleSelectSurah(num);
          }}
          onPlayAyah={(surahNum, ayahNum, total) => {
            audioPlayer.playAyah(surahNum, ayahNum, total);
          }}
          currentPlayingAyah={audioPlayer.currentAyahNumber}
          currentPlayingSurah={audioPlayer.currentSurahNumber}
          isPlaying={audioPlayer.isPlaying}
          settings={settings}
          onUpdateSettings={updateSettings}
          isBookmarked={(surahNum, ayahNum) =>
            bookmarks.some((b) => b.surahNumber === surahNum && b.ayahNumber === ayahNum)
          }
          onToggleBookmark={handleTogglePageBookmark}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTajweedLegend={() => setIsTajweedLegendOpen(true)}
        />
      ) : currentSurah ? (
        <SurahReader
          surah={currentSurah}
          onBack={() => {
            setCurrentSurah(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectSurah={(num) => handleSelectSurah(num)}
          onOpenPageMode={(pageNum) => {
            setCurrentSurah(null);
            setCurrentPageNumber(pageNum);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onPlayAyah={(surahNum, ayahNum, total) => {
            audioPlayer.playAyah(surahNum, ayahNum, total);
          }}
          currentPlayingAyah={
            audioPlayer.currentSurahNumber === currentSurah.number
              ? audioPlayer.currentAyahNumber
              : null
          }
          isPlaying={audioPlayer.isPlaying}
          settings={settings}
          onUpdateSettings={updateSettings}
          isBookmarked={isAyahBookmarked}
          onToggleBookmark={handleToggleBookmark}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTajweedLegend={() => setIsTajweedLegendOpen(true)}
          targetAyah={targetAyah}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Header Brand for App (Home Screen) */}
          <header className="bg-gradient-to-b from-emerald-900 via-emerald-900 to-emerald-950 text-white pt-8 pb-10 px-4 sm:px-6 shadow-md border-b border-emerald-800 relative overflow-hidden">
            {/* Subtle Islamic pattern background effect */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-800 border-2 border-amber-400/60 p-2 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                  <img
                    src="/icon.svg"
                    alt="القرآن الكريم"
                    className="w-full h-full object-contain filter drop-shadow"
                  />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-['Amiri',serif] tracking-wide text-amber-300 drop-shadow-sm">
                    القرآن الكريم
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-200 font-medium mt-0.5">
                    القراءة والتلاوة الصوتية العذبة برواية حفص عن عاصم
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="header-dua-btn"
                  onClick={() => setIsDuaOpen(true)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 border border-emerald-700/60 flex items-center gap-1.5 text-xs font-bold transition"
                  title="دعاء ختم القرآن"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">دعاء الختم</span>
                </button>

                <button
                  id="header-settings-btn"
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-700/60 flex items-center gap-1.5 text-xs font-bold transition"
                  title="الإعدادات والمظهر"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">الإعدادات</span>
                </button>
              </div>
            </div>
          </header>

          {/* Android PWA Install Banner */}
          <div className="max-w-5xl mx-auto w-full">
            <PWAInstallBanner />
          </div>

          {/* Surah List & Browser */}
          <main className="flex-1">
            <SurahList
              onSelectSurah={handleSelectSurah}
              onSelectPage={(pageNum) => {
                setCurrentSurah(null);
                setCurrentPageNumber(pageNum);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPlaySurah={handlePlaySurahFromList}
              onPlayAyah={(surahNum, ayahNum, total) => {
                audioPlayer.playAyah(surahNum, ayahNum, total);
              }}
              currentlyPlayingSurah={audioPlayer.currentSurahNumber}
              isPlaying={audioPlayer.isPlaying}
              bookmarks={bookmarks}
              onRemoveBookmark={handleRemoveBookmark}
              lastRead={lastRead}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenDua={() => setIsDuaOpen(true)}
              font={settings.font}
            />
          </main>
        </div>
      )}

      {/* Loading Surah Modal Overlay */}
      {isLoadingSurah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col items-center gap-3 max-w-xs text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
              جاري فتح السورة الكريمة...
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              يرجى الانتظار للحظات
            </span>
          </div>
        </div>
      )}

      {/* Surah Loading Error Modal */}
      {surahError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-w-sm text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
              تعذر تحميل السورة
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-4">{surahError}</p>
            <button
              onClick={() => setSurahError(null)}
              className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {/* Persistent Android Audio Player Bar */}
      <AudioPlayerBar
        isPlaying={audioPlayer.isPlaying}
        isLoading={audioPlayer.isLoading}
        currentSurahNumber={audioPlayer.currentSurahNumber}
        currentAyahNumber={audioPlayer.currentAyahNumber}
        totalAyahsInSurah={audioPlayer.totalAyahsInSurah}
        activeReciter={audioPlayer.activeReciter}
        repeatMode={audioPlayer.repeatMode}
        playbackSpeed={audioPlayer.playbackSpeed}
        currentTime={audioPlayer.currentTime}
        duration={audioPlayer.duration}
        errorMessage={audioPlayer.errorMessage}
        onTogglePlay={audioPlayer.togglePlay}
        onNext={audioPlayer.nextAyah}
        onPrev={audioPlayer.prevAyah}
        onSeek={audioPlayer.seekTo}
        onSelectReciter={(r) => {
          audioPlayer.setReciter(r);
          updateSettings({ selectedReciterId: r.id });
        }}
        onSpeedChange={audioPlayer.setPlaybackSpeed}
        onRepeatModeChange={audioPlayer.setRepeatMode}
        onClose={audioPlayer.stop}
        onScrollToCurrentAyah={() => {
          if (
            audioPlayer.currentSurahNumber &&
            (!currentSurah || currentSurah.number !== audioPlayer.currentSurahNumber)
          ) {
            handleSelectSurah(audioPlayer.currentSurahNumber, audioPlayer.currentAyahNumber || 1);
          }
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onOpenTajweedLegend={() => setIsTajweedLegendOpen(true)}
      />

      {/* Tajweed Legend & Rules Modal */}
      <TajweedLegendModal
        isOpen={isTajweedLegendOpen}
        onClose={() => setIsTajweedLegendOpen(false)}
      />

      {/* Dua Khatm Modal */}
      <DuaModal isOpen={isDuaOpen} onClose={() => setIsDuaOpen(false)} />
    </div>
  );
}
