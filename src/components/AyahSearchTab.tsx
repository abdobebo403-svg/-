import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Play, BookOpen, Copy, Check, ArrowLeft, Sparkles, BookCheck, AlertCircle } from 'lucide-react';
import { AyahSearchResult } from '../types';
import { searchQuranAyahsClean, stripArabicDiacritics } from '../services/quranApi';
import { SURAH_METADATA } from '../data/quranMetadata';

interface AyahSearchTabProps {
  onSelectSurah: (surahNumber: number, startAyah?: number) => void;
  onSelectPage?: (pageNumber: number) => void;
  onPlayAyah?: (surahNumber: number, ayahNumber: number, totalAyahs: number) => void;
  onShowTafseer?: (target: {
    surahNumber: number;
    surahName: string;
    numberInSurah: number;
    text: string;
    numberOfAyahs?: number;
  }) => void;
  initialQuery?: string;
}

export const AyahSearchTab: React.FC<AyahSearchTabProps> = ({
  onSelectSurah,
  onSelectPage,
  onPlayAyah,
  onShowTafseer,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AyahSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sampleSearches = [
    'كتب عليكم الصيام',
    'الله نور السماوات',
    'ألا بذكر الله تطمئن القلوب',
    'إنا أعطيناك الكوثر',
    'قل هو الله أحد',
  ];

  const performSearch = async (searchTerm: string) => {
    const clean = stripArabicDiacritics(searchTerm);
    if (!clean || clean.length < 2) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const matches = await searchQuranAyahsClean(searchTerm);
      setResults(matches);
    } catch (e) {
      console.error('Search failed:', e);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 320);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  const handleCopyAyah = (result: AyahSearchResult) => {
    const text = `﴿${result.text}﴾ [سورة ${result.surahName} : الآية ${result.numberInSurah}]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAyahId(result.number);
      setTimeout(() => setCopiedAyahId(null), 2000);
    });
  };

  // Helper to highlight matched words in the clean text
  const highlightMatch = (text: string, term: string) => {
    const cleanTerm = stripArabicDiacritics(term);
    if (!cleanTerm) return text;

    try {
      // Split by term for simple highlighting
      const parts = text.split(new RegExp(`(${cleanTerm})`, 'gi'));
      return (
        <span>
          {parts.map((part, idx) =>
            stripArabicDiacritics(part) === cleanTerm ? (
              <mark
                key={idx}
                className="bg-amber-300 dark:bg-amber-400 text-stone-950 font-bold px-1 rounded mx-0.5"
              >
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </span>
      );
    } catch (_) {
      return text;
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Search Input Box with info label */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="ayah-clean-search"
            className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>البحث في نصوص القرآن الكريم (بدون تشكيل):</span>
          </label>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            يتعرف تلقائياً على الهمزات والتنوين والتشكيل
          </span>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="ayah-clean-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب كلمة أو جملة من الآية الكريمة (مثال: كتب عليكم الصيام، الله نور، اهدنا الصراط)..."
            className="w-full pr-11 pl-12 py-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-sm placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-emerald-500 border border-stone-200 dark:border-stone-700 transition"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 bg-stone-200 dark:bg-stone-700 px-2 py-1 rounded-md"
            >
              مسح
            </button>
          )}
        </div>

        {/* Quick Sample Queries */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">أمثلة سريعة:</span>
          {sampleSearches.map((sample) => (
            <button
              key={sample}
              onClick={() => setQuery(sample)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-stone-700 transition border border-stone-200/60 dark:border-stone-700/60"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header / Status */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-500 dark:text-stone-400">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          <p className="text-sm">جاري البحث في آيات المصحف الشريف...</p>
        </div>
      )}

      {!isLoading && hasSearched && results.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-stone-600 dark:text-stone-400">
          <span>
            تم العثور على <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{results.length}</strong> آية كريمة مطابقة:
          </span>
        </div>
      )}

      {/* Results List */}
      {!isLoading && hasSearched && results.length === 0 && (
        <div className="py-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
            لم نتمكن من العثور على آيات تطابق «{query}»
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            تأكد من كتابة الكلمة بصورة صحيحة، أو جرّب البحث بجزء أصغر من الآية (مثلاً كلمة أو كلمتين).
          </p>
        </div>
      )}

      {/* Initial Empty State */}
      {!isLoading && !hasSearched && (
        <div className="py-10 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-2">
          <BookCheck className="w-9 h-9 text-emerald-600 mx-auto opacity-80" />
          <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
            ابحث في جميع آيات القرآن الكريم بدون تشكيل
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            يمكنك كتابة أي كلمة أو عبارة حتى لو كانت بدون همزات أو حركات، وسيتم البحث في المصحف كاملاً والوصول للآية فوراً.
          </p>
        </div>
      )}

      {/* Results Grid / Cards */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => {
            const meta = SURAH_METADATA.find((s) => s.number === result.surahNumber);
            const totalAyahs = meta?.numberOfAyahs || 7;

            return (
              <div
                key={`${result.surahNumber}-${result.numberInSurah}`}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs transition space-y-3 group"
              >
                {/* Card Top: Surah & Ayah Reference */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center font-sans border border-emerald-200 dark:border-emerald-800">
                      {result.numberInSurah}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold font-['Amiri',serif] text-stone-900 dark:text-stone-100">
                        سورة {result.surahName}
                      </h4>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-sans">
                        <span>الآية {result.numberInSurah}</span>
                        <span>•</span>
                        <span>صفحة {result.page}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Jump to Ayah Button */}
                  <button
                    onClick={() => onSelectSurah(result.surahNumber, result.numberInSurah)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                    title="الذهاب إلى الآية في السورة"
                  >
                    <span>فتح الآية</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Ayah Text Display */}
                <p
                  className="text-stone-800 dark:text-stone-200 text-base sm:text-lg leading-relaxed font-['Amiri_Quran',serif] text-right pt-1"
                  dir="rtl"
                >
                  ﴿{highlightMatch(result.text, query)}﴾
                </p>

                {/* Card Actions Row */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {/* Listen to this Ayah */}
                    {onPlayAyah && (
                      <button
                        onClick={() =>
                          onPlayAyah(result.surahNumber, result.numberInSurah, totalAyahs)
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 text-stone-700 dark:text-stone-300 transition font-medium"
                        title="استماع إلى هذه الآية"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">استماع</span>
                      </button>
                    )}

                    {/* Show Concise Tafseer */}
                    {onShowTafseer && (
                      <button
                        onClick={() =>
                          onShowTafseer({
                            surahNumber: result.surahNumber,
                            surahName: result.surahName,
                            numberInSurah: result.numberInSurah,
                            text: result.text,
                            numberOfAyahs: totalAyahs,
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition font-medium border border-amber-200/50 dark:border-amber-800/50"
                        title="عرض التفسير الميسر"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>التفسير</span>
                      </button>
                    )}

                    {/* Go to Page */}
                    {onSelectPage && (
                      <button
                        onClick={() => onSelectPage(result.page)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 transition font-medium"
                        title={`الانتقال إلى صفحة ${result.page} في المصحف`}
                      >
                        <span>صفحة {result.page}</span>
                      </button>
                    )}
                  </div>

                  {/* Copy Ayah */}
                  <button
                    onClick={() => handleCopyAyah(result)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition font-medium"
                    title="نسخ الآية الكريمة"
                  >
                    {copiedAyahId === result.number ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">تم</span>
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
            );
          })}
        </div>
      )}
    </div>
  );
};
