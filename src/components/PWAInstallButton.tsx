import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-md">
        <Check className="w-3.5 h-3.5" />
        Installed App
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={async () => {
            const ok = await install();
            if (ok) setInstallSuccess(true);
          }}
          className={`flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-medium shadow-md transition ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          }`}
          aria-label="Install OmniLearn AI app on this device for offline learning"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>{compact ? 'Install App' : 'Install Offline App'}</span>
        </button>
        {installSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-xl text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> OmniLearn AI installed successfully!
          </div>
        )}
      </>
    );
  }

  // iOS Safari flow (WebKit doesn't trigger beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-cyan-700/60 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/50 transition font-medium ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
          aria-label="Install on iPhone or iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-semibold">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <p>
                    Tap the <strong>Share</strong> button (box with an upward arrow) at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <p>
                    Tap <strong>Add</strong> in the top-right corner to access lessons completely offline!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-sm font-semibold text-white transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
