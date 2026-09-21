import { SURAH_METADATA } from './quranMetadata';

export interface PageSummary {
  pageNumber: number; // 1..604
  juz: number;
  hizb: number;
  surahNumber: number;
  surahName: string;
}

// Juz starting pages in standard Medina Mushaf (1-indexed)
export const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export function getJuzForPage(page: number): number {
  if (page < 1) return 1;
  if (page > 604) return 30;
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    if (page >= JUZ_START_PAGES[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getPrimarySurahForPage(page: number) {
  if (page < 1) return SURAH_METADATA[0];
  if (page >= 604) return SURAH_METADATA[113];

  // Find the last surah that starts on or before this page
  let found = SURAH_METADATA[0];
  for (const s of SURAH_METADATA) {
    if (s.page <= page) {
      found = s;
    } else {
      break;
    }
  }
  return found;
}

// Pre-computed page summaries for all 604 pages
export const QURAN_PAGES_SUMMARY: PageSummary[] = Array.from({ length: 604 }, (_, idx) => {
  const pageNumber = idx + 1;
  const juz = getJuzForPage(pageNumber);
  const hizb = Math.min(60, Math.max(1, (juz - 1) * 2 + (pageNumber % 20 > 10 ? 2 : 1)));
  const surah = getPrimarySurahForPage(pageNumber);

  return {
    pageNumber,
    juz,
    hizb,
    surahNumber: surah.number,
    surahName: surah.name,
  };
});
