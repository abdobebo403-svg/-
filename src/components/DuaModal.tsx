import React from 'react';
import { X, Sparkles, BookOpen, Share2 } from 'lucide-react';
import { DUA_KHATM, AYAT_AL_KURSI } from '../data/duaKhatm';

interface DuaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DuaModal: React.FC<DuaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="dua-khatm-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-stone-50 dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 shrink-0 bg-stone-100/60 dark:bg-stone-950/60">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-['Cairo',sans-serif]">
                دعاء ختم القرآن الكريم
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                أدعية مأثورة مباركة عند ختم كتاب الله عز وجل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1 divide-y divide-stone-200 dark:divide-stone-800">
          {/* Ayat Al Kursi Special Section */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-2">
              <BookOpen className="w-4 h-4" />
              <span>{AYAT_AL_KURSI.name}</span>
            </div>
            <p className="text-stone-800 dark:text-stone-200 font-['Amiri_Quran',serif] text-xl leading-loose text-center py-2">
              {AYAT_AL_KURSI.text}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 italic text-center">
              {AYAT_AL_KURSI.virtue}
            </p>
          </div>

          {/* Duas list */}
          {DUA_KHATM.map((item, idx) => (
            <div key={idx} className="pt-5 first:pt-0">
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2">
                {item.title}
              </h4>
              <p className="text-stone-800 dark:text-stone-200 font-['Amiri',serif] text-lg sm:text-xl leading-relaxed text-justify bg-white dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                {item.arabic}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100/80 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
