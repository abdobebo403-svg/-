import { Reciter } from '../types';

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'مشاري بن راشد العفاسي',
    subname: 'رواية حفص عن عاصم - مرتل',
    folder: 'Alafasy_128kbps',
  },
  {
    id: 'abdulbasit_murattal',
    name: 'عبد الباسط عبد الصمد',
    subname: 'مرتل - جودة عالية',
    folder: 'Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'abdulbasit_mujawwad',
    name: 'عبد الباسط عبد الصمد',
    subname: 'المصحف المجوّد الشهير',
    folder: 'Abdul_Basit_Mujawwad_128kbps',
  },
  {
    id: 'banna',
    name: 'محمود علي البنا',
    subname: 'المصحف المرتل برواية حفص عن عاصم',
    folder: 'mahmoud_ali_al_banna_32kbps',
  },
  {
    id: 'husary',
    name: 'محمود خليل الحصري',
    subname: 'المصحف المرتل برواية حفص',
    folder: 'Husary_128kbps',
  },
  {
    id: 'minshawi',
    name: 'محمد صديق المنشاوي',
    subname: 'المصحف المرتل الخاشع',
    folder: 'Minshawy_Murattal_128kbps',
  },
  {
    id: 'muaiqly',
    name: 'ماهر المعيقلي',
    subname: 'إمام الحرم المكي الشريف',
    folder: 'Maher_AlMuaiqly_64kbps',
  },
  {
    id: 'ghamadi',
    name: 'سعد الغامدي',
    subname: 'تلاوة ندية هادئة',
    folder: 'Ghamadi_40kbps',
  },
  {
    id: 'shatri',
    name: 'أبو بكر الشاطري',
    subname: 'ترتيل عذب متقن',
    folder: 'Abu_Bakr_Ash-Shaatree_128kbps',
  },
];

/**
 * Returns the direct audio URL for a specific Ayah from EveryAyah CDN.
 * EveryAyah uses format: 3-digit surah + 3-digit ayah e.g. 001001.mp3
 */
export function getAyahAudioUrl(folder: string, surahNumber: number, ayahNumber: number): string {
  const surahStr = String(surahNumber).padStart(3, '0');
  const ayahStr = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/${folder}/${surahStr}${ayahStr}.mp3`;
}
