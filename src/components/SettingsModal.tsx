import React from 'react';
import { X, Check, Type, Palette, Volume2, MoveDown, BookOpen, Layers, FileText, Book, Sparkles } from 'lucide-react';
import { UserSettings, AppTheme, ArabicFont, ReaderMode } from '../types';
import { RECITERS } from '../data/reciters';
import { TajweedText } from './TajweedText';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenTajweedLegend?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenTajweedLegend,
}) => {
  if (!isOpen) return null;

  const themes: { id: AppTheme; label: string; previewClass: string }[] = [
    { id: 'emerald', label: 'أخضر وذهبي (كلاسيكي)', previewClass: 'bg-emerald-900 border-amber-400 text-amber-200' },
    { id: 'parchment', label: 'ورق المصحف (دافئ)', previewClass: 'bg-[#f4efe4] border-amber-700 text-stone-900' },
    { id: 'dark', label: 'الوضع الليلي (مريح)', previewClass: 'bg-stone-950 border-stone-700 text-stone-100' },
    { id: 'light', label: 'فاتح نقي', previewClass: 'bg-white border-stone-300 text-stone-900' },
  ];

  const fonts: { id: ArabicFont; label: string; fontClass: string }[] = [
    { id: 'amiri-quran', label: 'خط مصحف المدينة (أميري قرآن)', fontClass: "font-['Amiri_Quran',serif]" },
    { id: 'cairo', label: 'خط النسخ الحديث (القاهرة)', fontClass: "font-['Cairo',sans-serif]" },
    { id: 'scheherazade', label: 'خط شهرزاد النبوي', fontClass: "font-['Scheherazade_New',serif]" },
  ];

  const getFontFamilyStyle = (font: ArabicFont) => {
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

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-stone-50 dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 shrink-0 bg-stone-100/60 dark:bg-stone-950/60">
          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            إعدادات القراءة والمظهر
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center">
            <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-sans">
              معاينة حجم الخط ونمطه
            </div>
            <div
              style={{
                fontSize: `${settings.fontSize}px`,
                fontFamily: getFontFamilyStyle(settings.font),
                lineHeight: 1.8,
              }}
              className="text-stone-900 dark:text-stone-100 select-none py-1"
            >
              <TajweedText
                text="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                tajweedText="بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ [h:3[ٱ][l[ل]رَّح[p[ِي]مِ"
                enabled={settings.tajweedEnabled}
              />
            </div>
          </div>

          {/* Reading Mode Selection */}
          <div>
            <label className="block text-sm font-bold text-stone-800 dark:text-stone-200 mb-2.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              نمط القراءة المفضل
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ readerMode: 'pages' })}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  settings.readerMode === 'pages'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                <Layers className="w-5 h-5" />
                <span className="text-xs">صفحة بصفحة</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ readerMode: 'verses' })}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  settings.readerMode === 'verses'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs">آيات منفصلة</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ readerMode: 'mushaf' })}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  settings.readerMode === 'mushaf'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                <Book className="w-5 h-5" />
                <span className="text-xs">مصحف مستمر</span>
              </button>
            </div>
          </div>

          {/* Font Size Adjuster */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                حجم خط الآيات
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {settings.fontSize} بكسل
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">صغير</span>
              <input
                id="font-size-range"
                type="range"
                min={18}
                max={42}
                step={2}
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                className="w-full accent-emerald-600 h-2 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
              <span className="text-base text-stone-400 font-bold">كبير</span>
            </div>
          </div>

          {/* Font Family Selection */}
          <div>
            <label className="block text-sm font-bold text-stone-800 dark:text-stone-200 mb-2.5">
              نوع الخط القرآني
            </label>
            <div className="grid grid-cols-1 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ font: f.id })}
                  className={`w-full p-3 rounded-xl text-right flex items-center justify-between border transition ${
                    settings.font === f.id
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                      : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <span className={f.fontClass}>{f.label}</span>
                  {settings.font === f.id && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-bold text-stone-800 dark:text-stone-200 mb-2.5">
              نمط المظهر والألوان
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${t.previewClass} ${
                    settings.theme === t.id
                      ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-stone-900'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className="text-xs font-bold">{t.label}</span>
                  {settings.theme === t.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Default Reciter */}
          <div>
            <label className="block text-sm font-bold text-stone-800 dark:text-stone-200 mb-2.5 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              القارئ الافتراضي للتلاوة
            </label>
            <select
              id="settings-reciter-select"
              value={settings.selectedReciterId}
              onChange={(e) => onUpdateSettings({ selectedReciterId: e.target.value })}
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.subname})
                </option>
              ))}
            </select>
          </div>

          {/* Color-Coded Tajweed Switch */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    التجويد الملون للآيات
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    تلوين أحكام التلاوة (المدود، الغنن، القلقلة، والحروف غير المنطوقة)
                  </div>
                </div>
              </div>
              <input
                id="tajweed-toggle"
                type="checkbox"
                checked={settings.tajweedEnabled}
                onChange={(e) => onUpdateSettings({ tajweedEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer shrink-0"
              />
            </div>

            {settings.tajweedEnabled && (
              <div className="pt-2 border-t border-amber-500/15 flex items-center justify-between gap-2">
                <div className="text-xs font-['Amiri_Quran',serif]">
                  <span className="text-stone-500 dark:text-stone-400 ml-1.5 font-sans">مثال:</span>
                  <TajweedText
                    text="قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ"
                    tajweedText="قُلْ أَعُوذُ بِرَبِّ [h:14678[ٱ]لْفَلَ[q[ق]ِ"
                    enabled={true}
                  />
                </div>

                {onOpenTajweedLegend && (
                  <button
                    type="button"
                    onClick={onOpenTajweedLegend}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 font-bold flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>دليل أحكام التجويد</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Auto Scroll Switch */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <MoveDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  التمرير التلقائي مع التلاوة
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  مزامنة الشاشة تلقائياً مع الآية التي يتم تلاوتها
                </div>
              </div>
            </div>
            <input
              id="auto-scroll-toggle"
              type="checkbox"
              checked={settings.autoScroll}
              onChange={(e) => onUpdateSettings({ autoScroll: e.target.checked })}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100/80 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
