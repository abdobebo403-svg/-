import React from 'react';
import { X, Sparkles, BookOpen, Check } from 'lucide-react';
import { TAJWEED_RULES } from '../utils/tajweed';

interface TajweedLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TajweedLegendModal: React.FC<TajweedLegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = [
    {
      id: 'madd',
      title: 'أحكام المدود (تدرجات الأحمر والبرتقالي والكموني)',
      description: 'أحكام المد بحسب مقدار حركاته من اللازم إلى الطبيعي',
      rules: ['m', 'o', 'p', 'n'],
    },
    {
      id: 'ghunnah',
      title: 'الغنن والإخفاء والإدغام (تدرجات الأخضر والنيلي)',
      description: 'أحكام النون الساكنة والتنوين والميم الساكنة والغنة بمقدار حركتين',
      rules: ['g', 'f', 'c', 'i', 'w', 'a', 'd'],
    },
    {
      id: 'qalqalah',
      title: 'أحكام القلقلة (الأزرق السماوي)',
      description: 'اضطراب ونبرة الحرف الساكن عند النطق به',
      rules: ['q'],
    },
    {
      id: 'silent',
      title: 'الحروف التي لا تلفظ (الرمادي)',
      description: 'حروف رسمت في خط المصحف وتسقط عند الوصل أو لا تنطق بتاتاً',
      rules: ['h', 'l', 's'],
    },
  ];

  return (
    <div
      id="tajweed-legend-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl rounded-3xl bg-stone-50 dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                دليل ألوان التجويد وأحكام التلاوة
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                المعتمد في مصحف التجويد لتيسير قراءة القرآن الكريم
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
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-2.5">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-1.5">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {cat.title}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {cat.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cat.rules.map((ruleKey) => {
                  const rule = TAJWEED_RULES[ruleKey];
                  if (!rule) return null;

                  return (
                    <div
                      key={ruleKey}
                      className="p-3 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/70 shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white/20"
                            style={{ backgroundColor: rule.hex }}
                          />
                          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                            {rule.name}
                          </span>
                        </div>
                        {rule.harakat && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700/80 text-stone-600 dark:text-stone-300 font-medium">
                            {rule.harakat}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-2">
                        {rule.description}
                      </p>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-700/50 flex items-center justify-between text-xs">
                        <span className="text-stone-400 dark:text-stone-500 text-[11px]">
                          مثال:
                        </span>
                        <span
                          className={`font-bold font-serif text-sm ${rule.colorClass} ${rule.darkColorClass}`}
                        >
                          {rule.example}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100/80 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>فهمت أحكام التجويد</span>
          </button>
        </div>
      </div>
    </div>
  );
};
