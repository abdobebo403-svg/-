import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share2 } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // Show if installable on Android/Chrome or on iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div
        id="pwa-install-banner"
        className="mx-3 sm:mx-4 my-2.5 p-3 sm:p-4 rounded-2xl bg-gradient-to-l from-emerald-800 to-emerald-950 text-white shadow-lg border border-emerald-700/50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-amber-300">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-amber-200 truncate">تثبيت تطبيق القرآن الكريم</h4>
            <p className="text-xs text-emerald-100/90 truncate">ثبّت التطبيق كبرنامج أندرويد لسهولة القراءة والاستماع دون إنترنت</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isInstallable && (
            <button
              id="install-android-btn"
              onClick={install}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs shadow-md transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت</span>
            </button>
          )}

          {isIOS && (
            <button
              id="install-ios-btn"
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>طريقة التثبيت</span>
            </button>
          )}

          <button
            id="dismiss-install-banner"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition"
            aria-label="إغلاق الإشعار"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guided Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                تثبيت على الشاشة الرئيسية
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm text-stone-700 dark:text-stone-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <p>اضغط على زر المشاركة <strong className="text-emerald-600 dark:text-emerald-400">Share</strong> في أسفل متصفح Safari.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <p>اختر <strong className="text-emerald-600 dark:text-emerald-400">إضافة إلى الصفحة الرئيسية (Add to Home Screen)</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <p>اضغط <strong className="text-emerald-600 dark:text-emerald-400">إضافة (Add)</strong> في الزاوية العلوية لتثبيت الأيقونة.</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
            >
              تم الفهم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
