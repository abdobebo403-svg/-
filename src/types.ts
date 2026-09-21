export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMeta {
  number: number;
  name: string; // Arabic name with tashkeel
  englishName: string;
  revelationType: RevelationType;
  numberOfAyahs: number;
  startJuz: number;
  page: number;
}

export interface Ayah {
  number: number; // Global number in Quran (1..6236)
  numberInSurah: number; // 1..N
  text: string; // Arabic text with tashkeel
  tajweedText?: string; // Text with embedded Tajweed markup [rule[char]]
  juz: number;
  page?: number;
  tafseer?: string;
}

export interface SurahDetail extends SurahMeta {
  bismillahPre: boolean;
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  name: string;
  subname: string;
  folder: string; // EveryAyah folder name
  fullSurahServer?: string; // Optional full-surah MP3Quran base URL
}

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  date: string;
  previewText?: string;
}

export type ReaderMode = 'verses' | 'mushaf' | 'pages';
export type AppTheme = 'emerald' | 'parchment' | 'dark' | 'light';
export type ArabicFont = 'amiri-quran' | 'cairo' | 'scheherazade';

export interface PageAyah {
  number: number; // Global number in Quran (1..6236)
  numberInSurah: number;
  text: string;
  tajweedText?: string;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
  juz: number;
  page: number;
  hizbQuarter?: number;
  tafseer?: string;
}

export interface QuranPageData {
  pageNumber: number; // 1..604
  juz: number;
  hizbQuarter?: number;
  surahsOnPage: {
    number: number;
    name: string;
    englishName: string;
    revelationType: RevelationType;
    numberOfAyahs: number;
  }[];
  ayahs: PageAyah[];
}

export interface UserSettings {
  theme: AppTheme;
  font: ArabicFont;
  fontSize: number; // in pixels, e.g. 24
  readerMode: ReaderMode;
  selectedReciterId: string;
  autoScroll: boolean;
  playbackSpeed: number;
  tajweedEnabled: boolean; // Toggle color-coded Tajweed in reading mode
}

export interface AyahSearchResult {
  number: number; // Global number in Quran (1..6236)
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  text: string;
  page: number;
}
