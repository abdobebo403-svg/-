import { Ayah, SurahDetail, QuranPageData, PageAyah, AyahSearchResult } from '../types';
import { BUILT_IN_SURAHS } from '../data/builtInSurahs';
import { SURAH_METADATA } from '../data/quranMetadata';
import { getJuzForPage, getPrimarySurahForPage } from '../data/pageMetadata';

const CACHE_KEY_PREFIX = 'quran_surah_v2_';
const PAGE_CACHE_KEY_PREFIX = 'quran_page_v2_';
const inMemoryPageCache = new Map<number, QuranPageData>();

export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetail> {
  // 1. Check built-in surahs
  if (BUILT_IN_SURAHS[surahNumber]) {
    return BUILT_IN_SURAHS[surahNumber];
  }

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${surahNumber}`);
    if (cached) {
      const parsed = JSON.parse(cached) as SurahDetail;
      if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  const meta = SURAH_METADATA.find(s => s.number === surahNumber);
  if (!meta) {
    throw new Error(`سورة برقم ${surahNumber} غير موجودة`);
  }

  // 3. Fetch from Al-Quran Cloud API with Uthmani, Tajweed, and Tafseer Muyassar
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,quran-tajweed,ar.muyassar`,
      { cache: 'force-cache' }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 1) {
      const uthmaniEdition = json.data.find((d: any) => d.edition?.identifier === 'quran-uthmani') || json.data[0];
      const tajweedEdition = json.data.find((d: any) => d.edition?.identifier === 'quran-tajweed');
      const tafseerEdition = json.data.find((d: any) => d.edition?.identifier === 'ar.muyassar');

      const ayahs: Ayah[] = uthmaniEdition.ayahs.map((a: any, idx: number) => {
        let text = a.text;
        // Clean leading Bismillah for surahs other than Al-Fatiha if the API attached it to Ayah 1
        if (surahNumber !== 1 && surahNumber !== 9 && a.numberInSurah === 1) {
          const bismillahPrefixes = [
            "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          ];
          for (const b of bismillahPrefixes) {
            if (text.startsWith(b)) {
              text = text.replace(b, '').trim();
              break;
            }
          }
        }

        const tafseerText = tafseerEdition?.ayahs?.[idx]?.text || undefined;
        let tajweedText = tajweedEdition?.ayahs?.[idx]?.text || undefined;

        if (tajweedText && surahNumber !== 1 && surahNumber !== 9 && a.numberInSurah === 1) {
          const bismillahPrefixes = [
            "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
            "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          ];
          for (const b of bismillahPrefixes) {
            if (tajweedText.startsWith(b)) {
              tajweedText = tajweedText.replace(b, '').trim();
              break;
            }
          }
        }

        return {
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: text,
          tajweedText: tajweedText,
          juz: a.juz,
          page: a.page,
          tafseer: tafseerText,
        };
      });

      const detail: SurahDetail = {
        ...meta,
        bismillahPre: surahNumber !== 1 && surahNumber !== 9,
        ayahs,
      };

      // Save to localStorage for instant offline access next time
      try {
        localStorage.setItem(`${CACHE_KEY_PREFIX}${surahNumber}`, JSON.stringify(detail));
      } catch (storageErr) {
        console.warn('LocalStorage quota or write error:', storageErr);
      }

      return detail;
    }
  } catch (apiErr) {
    console.warn('Al-Quran API failed, attempting backup source:', apiErr);
  }

  // 4. Backup fallback: fetch single uthmani text
  try {
    const backupRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
    if (backupRes.ok) {
      const backupJson = await backupRes.json();
      if (backupJson.code === 200 && backupJson.data) {
        const ayahs: Ayah[] = backupJson.data.ayahs.map((a: any) => {
          let text = a.text;
          if (surahNumber !== 1 && surahNumber !== 9 && a.numberInSurah === 1) {
            const bismillahPrefix = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
            if (text.startsWith(bismillahPrefix)) {
              text = text.replace(bismillahPrefix, '').trim();
            }
          }
          return {
            number: a.number,
            numberInSurah: a.numberInSurah,
            text,
            juz: a.juz,
            page: a.page,
          };
        });

        const detail: SurahDetail = {
          ...meta,
          bismillahPre: surahNumber !== 1 && surahNumber !== 9,
          ayahs,
        };

        try {
          localStorage.setItem(`${CACHE_KEY_PREFIX}${surahNumber}`, JSON.stringify(detail));
        } catch (_) {}

        return detail;
      }
    }
  } catch (backupErr) {
    console.error('Backup source failed:', backupErr);
  }

  throw new Error('تعذر تحميل نص السورة، يرجى التأكد من الاتصال بالإنترنت.');
}

export async function fetchQuranPage(pageNumber: number): Promise<QuranPageData> {
  const page = Math.max(1, Math.min(604, pageNumber));

  // 1. Check in-memory cache
  if (inMemoryPageCache.has(page)) {
    return inMemoryPageCache.get(page)!;
  }

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(`${PAGE_CACHE_KEY_PREFIX}${page}`);
    if (cached) {
      const parsed = JSON.parse(cached) as QuranPageData;
      if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
        inMemoryPageCache.set(page, parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Page cache read error:', e);
  }

  // 3. Fallback for page 1 & 2 using built-in surahs if network fails
  const fallbackBuiltIn = () => {
    if (page === 1 && BUILT_IN_SURAHS[1]) {
      const fatiha = BUILT_IN_SURAHS[1];
      const pageAyahs: PageAyah[] = fatiha.ayahs.map(a => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: a.text,
        surahNumber: 1,
        surahName: fatiha.name,
        surahEnglishName: fatiha.englishName,
        numberOfAyahs: fatiha.numberOfAyahs,
        revelationType: fatiha.revelationType,
        juz: 1,
        page: 1,
        tafseer: a.tafseer,
      }));
      return {
        pageNumber: 1,
        juz: 1,
        surahsOnPage: [{
          number: 1,
          name: fatiha.name,
          englishName: fatiha.englishName,
          revelationType: fatiha.revelationType,
          numberOfAyahs: fatiha.numberOfAyahs,
        }],
        ayahs: pageAyahs,
      };
    }
    if (page === 2 && BUILT_IN_SURAHS[2]) {
      const baqarah = BUILT_IN_SURAHS[2];
      const pageAyahs: PageAyah[] = baqarah.ayahs.slice(0, 5).map(a => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: a.text,
        surahNumber: 2,
        surahName: baqarah.name,
        surahEnglishName: baqarah.englishName,
        numberOfAyahs: baqarah.numberOfAyahs,
        revelationType: baqarah.revelationType,
        juz: 1,
        page: 2,
        tafseer: a.tafseer,
      }));
      return {
        pageNumber: 2,
        juz: 1,
        surahsOnPage: [{
          number: 2,
          name: baqarah.name,
          englishName: baqarah.englishName,
          revelationType: baqarah.revelationType,
          numberOfAyahs: baqarah.numberOfAyahs,
        }],
        ayahs: pageAyahs,
      };
    }
    return null;
  };

  // 4. Fetch from Al-Quran Cloud API
  try {
    const [uthmaniRes, tajweedRes, tafseerRes] = await Promise.allSettled([
      fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`, { cache: 'force-cache' }),
      fetch(`https://api.alquran.cloud/v1/page/${page}/quran-tajweed`, { cache: 'force-cache' }),
      fetch(`https://api.alquran.cloud/v1/page/${page}/ar.muyassar`, { cache: 'force-cache' }),
    ]);

    if (uthmaniRes.status === 'fulfilled' && uthmaniRes.value.ok) {
      const uthmaniJson = await uthmaniRes.value.json();
      let tafseerJson: any = null;
      if (tafseerRes.status === 'fulfilled' && tafseerRes.value.ok) {
        try {
          tafseerJson = await tafseerRes.value.json();
        } catch (_) {}
      }

      let tajweedJson: any = null;
      if (tajweedRes.status === 'fulfilled' && tajweedRes.value.ok) {
        try {
          tajweedJson = await tajweedRes.value.json();
        } catch (_) {}
      }

      if (uthmaniJson.code === 200 && uthmaniJson.data && Array.isArray(uthmaniJson.data.ayahs)) {
        const rawAyahs = uthmaniJson.data.ayahs;
        const tafseerAyahs = tafseerJson?.data?.ayahs || [];
        const tajweedAyahs = tajweedJson?.data?.ayahs || [];

        const surahMap = new Map<number, {
          number: number;
          name: string;
          englishName: string;
          revelationType: any;
          numberOfAyahs: number;
        }>();

        const ayahs: PageAyah[] = rawAyahs.map((a: any, idx: number) => {
          const s = a.surah;
          if (s && !surMapHas(surahMap, s.number)) {
            const meta = SURAH_METADATA.find(m => m.number === s.number);
            surahMap.set(s.number, {
              number: s.number,
              name: meta?.name || s.name.replace('سُورَةُ ', ''),
              englishName: s.englishName,
              revelationType: s.revelationType,
              numberOfAyahs: s.numberOfAyahs,
            });
          }

          let text = a.text.replace(/^\uFEFF/, '').trim();
          // If the API prepended Bismillah to Ayah 1 of any surah other than Fatiha & Tawbah
          if (s.number !== 1 && s.number !== 9 && a.numberInSurah === 1) {
            const bismillahPrefixes = [
              "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
              "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
            ];
            for (const b of bismillahPrefixes) {
              if (text.startsWith(b)) {
                text = text.replace(b, '').trim();
                break;
              }
            }
          }

          const tafseerText = tafseerAyahs[idx]?.text || undefined;
          let tajweedText = tajweedAyahs[idx]?.text || undefined;

          if (tajweedText && s.number !== 1 && s.number !== 9 && a.numberInSurah === 1) {
            const bismillahPrefixes = [
              "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
              "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
            ];
            for (const b of bismillahPrefixes) {
              if (tajweedText.startsWith(b)) {
                tajweedText = tajweedText.replace(b, '').trim();
                break;
              }
            }
          }

          const meta = SURAH_METADATA.find(m => m.number === s.number);

          return {
            number: a.number,
            numberInSurah: a.numberInSurah,
            text,
            tajweedText,
            surahNumber: s.number,
            surahName: meta?.name || s.name.replace('سُورَةُ ', ''),
            surahEnglishName: s.englishName,
            numberOfAyahs: s.numberOfAyahs,
            revelationType: s.revelationType,
            juz: a.juz || getJuzForPage(page),
            page: page,
            hizbQuarter: a.hizbQuarter,
            tafseer: tafseerText,
          };
        });

        const primarySurah = getPrimarySurahForPage(page);
        if (surahMap.size === 0 && primarySurah) {
          surahMap.set(primarySurah.number, {
            number: primarySurah.number,
            name: primarySurah.name,
            englishName: primarySurah.englishName,
            revelationType: primarySurah.revelationType,
            numberOfAyahs: primarySurah.numberOfAyahs,
          });
        }

        const pageData: QuranPageData = {
          pageNumber: page,
          juz: ayahs[0]?.juz || getJuzForPage(page),
          hizbQuarter: ayahs[0]?.hizbQuarter,
          surahsOnPage: Array.from(surahMap.values()),
          ayahs,
        };

        // Cache page
        inMemoryPageCache.set(page, pageData);
        try {
          localStorage.setItem(`${PAGE_CACHE_KEY_PREFIX}${page}`, JSON.stringify(pageData));
        } catch (_) {}

        // Trigger prefetch for next and previous page non-blockingly
        prefetchSurroundingPages(page);

        return pageData;
      }
    }
  } catch (err) {
    console.warn('Network page fetch failed:', err);
  }

  // Fallback to built-in if available
  const fallback = fallbackBuiltIn();
  if (fallback) {
    inMemoryPageCache.set(page, fallback);
    return fallback;
  }

  throw new Error(`تعذر تحميل الصفحة ${page}. يرجى التحقق من اتصال الإنترنت.`);
}

function surMapHas(map: Map<number, any>, key: number) {
  return map.has(key);
}

function prefetchSurroundingPages(currentPage: number) {
  setTimeout(() => {
    if (currentPage < 604 && !inMemoryPageCache.has(currentPage + 1)) {
      fetchQuranPage(currentPage + 1).catch(() => {});
    }
    if (currentPage > 1 && !inMemoryPageCache.has(currentPage - 1)) {
      fetchQuranPage(currentPage - 1).catch(() => {});
    }
  }, 1000);
}

// In-memory cache for Ayah concise tafseer
const ayahTafseerCache = new Map<string, string>();
const TAFSEER_CACHE_KEY_PREFIX = 'quran_ayah_tafseer_';

/**
 * Strips Arabic diacritics (tashkeel), tatweel, and normalizes various forms of alif and hamzas
 */
export function stripArabicDiacritics(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove tashkeel and Quranic stop symbols
    .replace(/\u0640/g, '') // Remove tatweel (kashida)
    .replace(/[أإآٱ]/g, 'ا') // Normalize alif variations
    .replace(/ة/g, 'ه') // Normalize taa marbuta
    .replace(/ى/g, 'ي') // Normalize alif maqsura
    .replace(/[\uFE70-\uFEFF]/g, '') // Remove Arabic presentation forms
    .trim();
}

/**
 * Fetches concise tafseer for a specific ayah (التفسير الميسر)
 */
export async function fetchAyahTafseer(surahNumber: number, ayahNumber: number): Promise<string> {
  const cacheKey = `${surahNumber}:${ayahNumber}`;

  // 1. Check in-memory cache
  if (ayahTafseerCache.has(cacheKey)) {
    return ayahTafseerCache.get(cacheKey)!;
  }

  // 2. Check built-in surahs
  if (BUILT_IN_SURAHS[surahNumber]?.ayahs?.[ayahNumber - 1]?.tafseer) {
    const t = BUILT_IN_SURAHS[surahNumber].ayahs[ayahNumber - 1].tafseer!;
    ayahTafseerCache.set(cacheKey, t);
    return t;
  }

  // 3. Check localStorage cache
  try {
    const cached = localStorage.getItem(`${TAFSEER_CACHE_KEY_PREFIX}${cacheKey}`);
    if (cached) {
      ayahTafseerCache.set(cacheKey, cached);
      return cached;
    }
  } catch (_) {}

  // 4. Fetch from Al-Quran Cloud API (Tafseer Al-Muyassar: ar.muyassar)
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.muyassar`, {
      cache: 'force-cache',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && json.data?.text) {
        const text = json.data.text.trim();
        ayahTafseerCache.set(cacheKey, text);
        try {
          localStorage.setItem(`${TAFSEER_CACHE_KEY_PREFIX}${cacheKey}`, text);
        } catch (_) {}
        return text;
      }
    }
  } catch (apiErr) {
    console.warn('Al-Quran cloud tafseer fetch failed:', apiErr);
  }

  // 5. Fallback source: Quran-tafseer.com (Tafseer Al-Muyassar: id 1)
  try {
    const backupRes = await fetch(`https://api.quran-tafseer.com/tafseer/1/${surahNumber}/${ayahNumber}`);
    if (backupRes.ok) {
      const backupJson = await backupRes.json();
      if (backupJson.text) {
        const text = backupJson.text.trim();
        ayahTafseerCache.set(cacheKey, text);
        try {
          localStorage.setItem(`${TAFSEER_CACHE_KEY_PREFIX}${cacheKey}`, text);
        } catch (_) {}
        return text;
      }
    }
  } catch (backupErr) {
    console.error('Backup tafseer fetch failed:', backupErr);
  }

  return 'عذراً، تعذر جلب التفسير الميسر للآية الكريمة في الوقت الحالي. يرجى التحقق من الاتصال بالإنترنت.';
}

/**
 * Searches the Holy Quran for ayahs matching the query WITHOUT tashkeel (diacritics)
 */
export async function searchQuranAyahsClean(rawQuery: string): Promise<AyahSearchResult[]> {
  const cleanQuery = stripArabicDiacritics(rawQuery);
  if (!cleanQuery || cleanQuery.length < 2) {
    return [];
  }

  try {
    const encoded = encodeURIComponent(cleanQuery);
    const res = await fetch(`https://api.alquran.cloud/v1/search/${encoded}/all/quran-simple-clean`, {
      cache: 'force-cache',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && json.data?.matches && Array.isArray(json.data.matches)) {
        const matches = json.data.matches;
        return matches.map((m: any) => {
          const sNum = m.surah.number;
          const meta = SURAH_METADATA.find((s) => s.number === sNum);
          return {
            number: m.number,
            numberInSurah: m.numberInSurah,
            surahNumber: sNum,
            surahName: meta?.name || m.surah.name.replace('سُورَةُ ', ''),
            surahEnglishName: meta?.englishName || m.surah.englishName,
            text: m.text,
            page: meta?.page || 1,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Al-Quran clean search fetch error:', err);
  }

  // Fallback: search in built-in surahs
  const localResults: AyahSearchResult[] = [];
  Object.values(BUILT_IN_SURAHS).forEach((surah) => {
    surah.ayahs.forEach((ayah) => {
      const cleanAyahText = stripArabicDiacritics(ayah.text);
      if (cleanAyahText.includes(cleanQuery)) {
        localResults.push({
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          surahNumber: surah.number,
          surahName: surah.name,
          surahEnglishName: surah.englishName,
          text: ayah.text,
          page: ayah.page || surah.page,
        });
      }
    });
  });

  return localResults;
}

