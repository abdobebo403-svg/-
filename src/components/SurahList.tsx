import React, { useState, useMemo } from 'react';
import { Search, BookMarked, Layers, Book, Play, Sparkles, SlidersHorizontal, Bookmark as BookmarkIcon, Trash2, ArrowLeft, FileText, Compass, ArrowUpDown } from 'lucide-react';
import { SurahMeta, Bookmark, ArabicFont } from '../types';
import { SURAH_METADATA, JUZ_LIST } from '../data/quranMetadata';
import { QURAN_PAGES_SUMMARY } from '../data/pageMetadata';
import { AyahSearchTab } from './AyahSearchTab';
import { ConciseTafseerModal, ConciseTafseerTarget } from './ConciseTafseerModal';

interface SurahListProps {
  onSelectSurah: (surahNumber: number, startAyah?: number) => void;
  onSelectPage?: (pageNumber: number) => void;
  onPlaySurah: (surahNumber: number) => void;
  onPlayAyah?: (surahNumber: number, ayahNumber: number, totalAyahs: number) => void;
  currentlyPlayingSurah: number | null;
  isPlaying: boolean;
  bookmarks: Bookmark[];
  onRemoveBookmark: (surahNumber: number, ayahNumber: number) => void;
  lastRead: Bookmark | null;
  onOpenSettings: () => void;
  onOpenDua: () => void;
  font?: ArabicFont;
}

type TabType = 'surahs' | 'ayahs' | 'pages' | 'juz' | 'bookmarks';
type RevelationFilter = 'all' | 'Meccan' | 'Medinan';

export const SurahList: React.FC<SurahListProps> = ({
  onSelectSurah,
  onSelectPage,
  onPlaySurah,
  onPlayAyah,
  currentlyPlayingSurah,
  isPlaying,
  bookmarks,
  onRemoveBookmark,
  lastRead,
  onOpenSettings,
  onOpenDua,
  font = 'amiri-quran',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('surahs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<RevelationFilter>('all');
  const [quickJumpInput, setQuickJumpInput] = useState('');
  const [conciseTafseerTarget, setConciseTafseerTarget] = useState<ConciseTafseerTarget | null>(null);

  // Normalize Arabic text for smart search (handles hamzas, tashkeel, etc.)
  const normalizeArabic = (text: string) => {
    return text
      .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase()
      .trim();
  };

  const filteredSurahs = useMemo(() => {
    const query = normalizeArabic(searchQuery);
    return SURAH_METADATA.filter((surah) => {
      // Match revelation filter
      if (filterType !== 'all' && surah.revelationType !== filterType) {
        return false;
      }
      // Match search query (number, Arabic name, English name)
      if (!query) return true;

      const normName = normalizeArabic(surah.name);
      const normEnglish = surah.englishName.toLowerCase();
      const numMatch = String(surah.number) === query;

      return normName.includes(query) || normEnglish.includes(query) || numMatch;
    });
  }, [searchQuery, filterType]);

  const filteredPages = useMemo(() => {
    const query = normalizeArabic(searchQuery);
    if (!query) return QURAN_PAGES_SUMMARY;

    return QURAN_PAGES_SUMMARY.filter((p) => {
      const pageStr = String(p.pageNumber);
      const juzStr = `الجزء ${p.juz}`.replace(' ', '');
      const surahNorm = normalizeArabic(p.surahName);

      return (
        pageStr === query ||
        pageStr.includes(query) ||
        surahNorm.includes(query) ||
        normalizeArabic(juzStr).includes(query)
      );
    });
  }, [searchQuery]);

  const handleQuickJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(quickJumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 604 && onSelectPage) {
      onSelectPage(num);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 pb-28 pt-2">
      {/* Top Banner: Last Read Quick Resume */}
      {lastRead && (
        <div
          id="last-read-banner"
          onClick={() => onSelectSurah(lastRead.surahNumber, lastRead.ayahNumber)}
          className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-lg border border-emerald-700/50 cursor-pointer hover:shadow-xl transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shrink-0">
              <BookMarked className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-emerald-200 font-medium block">متابعة القراءة من آخر توقف</span>
              <h3 className="text-base sm:text-lg font-bold text-amber-300 group-hover:text-amber-200 transition">
                سورة {lastRead.surahName} - الآية {lastRead.ayahNumber}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700/80 group-hover:bg-emerald-600 text-xs font-bold text-white transition shrink-0">
            <span>متابعة</span>
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-2.5 sm:p-3 shadow-sm border border-stone-200 dark:border-stone-800 mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            id="quran-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم السورة (مثلاً: البقرة، الكهف) أو رقمها..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 bg-stone-200 dark:bg-stone-700 px-1.5 py-0.5 rounded-md"
            >
              مسح
            </button>
          )}
        </div>

        {/* Dua Khatm Button */}
        <button
          id="open-dua-khatm-btn"
          onClick={onOpenDua}
          className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 border border-amber-200/60 dark:border-amber-800/50 transition flex items-center gap-1 text-xs font-bold shrink-0"
          title="دعاء ختم القرآن"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">دعاء الختم</span>
        </button>

        {/* Settings Button */}
        <button
          id="open-settings-btn"
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition shrink-0"
          title="الإعدادات والمظهر"
          aria-label="إعدادات التطبيق"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Jump to Ayah Search suggestion if typing in surahs */}
      {searchQuery.trim().length >= 2 && activeTab === 'surahs' && (
        <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              هل تبحث في نصوص الآيات عن «<strong className="underline">{searchQuery}</strong>»؟
            </span>
          </div>
          <button
            onClick={() => setActiveTab('ayahs')}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs transition"
          >
            بحث في الآيات بدون تشكيل ⟵
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2 mb-4 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="tab-surahs"
            onClick={() => setActiveTab('surahs')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'surahs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Book className="w-4 h-4" />
            <span>السور</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-stone-800 text-current">
              114
            </span>
          </button>

          <button
            id="tab-ayahs"
            onClick={() => setActiveTab('ayahs')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'ayahs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>بحث الآيات</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-950 font-bold">
              بدون تشكيل
            </span>
          </button>

          <button
            id="tab-pages"
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'pages'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الصفحات</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-stone-800 text-current">
              604
            </span>
          </button>

          <button
            id="tab-juz"
            onClick={() => setActiveTab('juz')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'juz'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأجزاء</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-stone-800 text-current">
              30
            </span>
          </button>

          <button
            id="tab-bookmarks"
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            <span>المحفوظات</span>
            {bookmarks.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-900 font-bold">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter chips (only in surahs tab) */}
        {activeTab === 'surahs' && (
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'all'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold'
                  : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('Meccan')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'Meccan'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              مكية
            </button>
            <button
              onClick={() => setFilterType('Medinan')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'Medinan'
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              مدنية
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'surahs' && (
        <div>
          {filteredSurahs.length === 0 ? (
            <div className="text-center py-16 text-stone-500 dark:text-stone-400">
              <Book className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-600" />
              <p className="text-base font-semibold">لم نجد سورة مطابقة لبحثك</p>
              <p className="text-xs mt-1">تأكد من كتابة اسم السورة بشكل صحيح</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSurahs.map((surah) => {
                const isCurrentPlaying = currentlyPlayingSurah === surah.number && isPlaying;
                return (
                  <div
                    key={surah.number}
                    id={`surah-card-${surah.number}`}
                    onClick={() => onSelectSurah(surah.number)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group relative overflow-hidden ${
                      isCurrentPlaying
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 shadow-md'
                        : 'bg-white dark:bg-stone-900/90 border-stone-200 dark:border-stone-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md'
                    }`}
                  >
                    {/* Right side: Number and Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Islamic Star Number Badge */}
                      <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-800 dark:text-stone-200 font-bold text-sm shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                        {surah.number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-['Amiri',serif] text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                            سورة {surah.name}
                          </h4>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-medium ${
                              surah.revelationType === 'Meccan'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            }`}
                          >
                            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-1">
                          <span>{surah.numberOfAyahs} آية</span>
                          <span>•</span>
                          <span>الجزء {surah.startJuz}</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectPage) {
                                onSelectPage(surah.page);
                              }
                            }}
                            className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                            title="قراءة في المصحف صفحة بصفحة"
                          >
                            صفحة {surah.page}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Left side: Quick Recite Button */}
                    <button
                      id={`play-surah-${surah.number}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaySurah(surah.number);
                      }}
                      className={`p-2.5 rounded-xl transition ${
                        isCurrentPlaying
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-stone-800'
                      }`}
                      aria-label={`تلاوة سورة ${surah.name}`}
                      title={`استمع إلى سورة ${surah.name}`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pages Tab (قراءة صفحة بصفحة 1 - 604) */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          {/* Quick Page Jump Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-400/30 dark:border-amber-700/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-right w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  انتقال سريع لرقم الصفحة
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  المصحف الشريف كامل (٦٠٤ صفحة)
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickJumpPage} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                id="quick-jump-page-input"
                type="number"
                min={1}
                max={604}
                placeholder="رقم (1 - 604)"
                value={quickJumpInput}
                onChange={(e) => setQuickJumpInput(e.target.value)}
                className="w-full sm:w-36 py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-bold text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 text-center"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition shrink-0"
              >
                انتقال
              </button>
            </form>
          </div>

          {/* Grid of Pages */}
          {filteredPages.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              لا توجد صفحة تطابق بحثك
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {filteredPages.map((page) => (
                <div
                  key={page.pageNumber}
                  id={`page-card-${page.pageNumber}`}
                  onClick={() => onSelectPage && onSelectPage(page.pageNumber)}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between text-right group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                      {page.pageNumber}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans">
                      جزء {page.juz}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-['Amiri',serif] font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition truncate">
                      سورة {page.surahName}
                    </h5>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">
                      الحزب {page.hizb}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Juz Tab */}
      {activeTab === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {JUZ_LIST.map((juz) => {
            const surah = SURAH_METADATA.find((s) => s.number === juz.startSurahNumber);
            return (
              <div
                key={juz.number}
                onClick={() => onSelectSurah(juz.startSurahNumber)}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 hover:shadow-md cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0">
                    {juz.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 transition">
                      {juz.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      يبدأ من سورة {surah?.name || ''}
                    </p>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition" />
              </div>
            );
          })}
        </div>
      )}

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarks.length === 0 ? (
            <div className="text-center py-16 text-stone-500 dark:text-stone-400">
              <BookmarkIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
              <p className="text-base font-semibold">لا توجد علامات مرجعية محفوظة بعد</p>
              <p className="text-xs mt-1">
                أثناء قراءة أي سورة، يمكنك الضغط على علامة الحفظ بجانب الآية لحفظ موضع قراءتك.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((b) => (
                <div
                  key={`${b.surahNumber}-${b.ayahNumber}`}
                  onClick={() => onSelectSurah(b.surahNumber, b.ayahNumber)}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <BookmarkIcon className="w-5 h-5 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition">
                          سورة {b.surahName}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          الآية {b.ayahNumber}
                        </span>
                      </div>
                      {b.previewText && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-1 font-['Amiri',serif]">
                          {b.previewText}
                        </p>
                      )}
                      <span className="text-[10px] text-stone-400 block mt-1">
                        تاريخ الحفظ: {b.date}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(b.surahNumber, b.ayahNumber);
                    }}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0"
                    title="حذف العلامة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AYAH SEARCH TAB (WITHOUT TASHKEEL) */}
      {activeTab === 'ayahs' && (
        <AyahSearchTab
          initialQuery={searchQuery}
          onSelectSurah={(surahNum, startAyah) => onSelectSurah(surahNum, startAyah)}
          onSelectPage={onSelectPage}
          onPlayAyah={onPlayAyah}
          onShowTafseer={(target) => setConciseTafseerTarget(target)}
        />
      )}

      {/* Concise Tafseer Modal for any clicked Ayah */}
      <ConciseTafseerModal
        target={conciseTafseerTarget}
        onClose={() => setConciseTafseerTarget(null)}
        onPlayAyah={onPlayAyah}
        font={font}
      />
    </div>
  );
};
