import React from 'react';
import { useAccessibility, ContrastTheme, TextScale } from '../context/AccessibilityContext';
import { X, Volume2, Eye, Type, Sparkles, Moon, Sun, Flame, ZapOff, Keyboard } from 'lucide-react';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    theme,
    setTheme,
    dyslexiaFont,
    setDyslexiaFont,
    textScale,
    setTextScale,
    reducedMotion,
    setReducedMotion,
    easyReadMode,
    setEasyReadMode,
    ttsRate,
    setTtsRate,
    speakText,
    isSpeaking,
  } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id="accessibility-heading" className="text-lg font-bold text-white">
                Assistive & Accessibility Settings
              </h2>
              <p className="text-xs text-slate-400">
                Tailored for dyslexia, visual contrast, neurodivergent, and remote learners.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Close accessibility settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Contrast Theme */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Visual Contrast & Themes
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition ${
                  theme === 'dark'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Moon className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold">Modern Dark</div>
                  <div className="text-[10px] text-slate-400">Standard low-glare</div>
                </div>
              </button>

              <button
                onClick={() => setTheme('high-contrast-dark')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition ${
                  theme === 'high-contrast-dark'
                    ? 'border-amber-400 bg-black text-amber-300 ring-2 ring-amber-400'
                    : 'border-slate-800 bg-black text-white hover:border-slate-600'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border border-black" />
                <div>
                  <div className="font-bold">High Contrast OLED</div>
                  <div className="text-[10px] text-yellow-300/80">Pure black + bright contrast</div>
                </div>
              </button>

              <button
                onClick={() => setTheme('high-contrast-light')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition ${
                  theme === 'high-contrast-light'
                    ? 'border-blue-600 bg-white text-slate-950 ring-2 ring-blue-600'
                    : 'border-slate-800 bg-slate-200 text-slate-900 hover:bg-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-bold">High Contrast Light</div>
                  <div className="text-[10px] text-slate-700">Crisp daytime clarity</div>
                </div>
              </button>

              <button
                onClick={() => setTheme('warm-amber')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition ${
                  theme === 'warm-amber'
                    ? 'border-amber-500 bg-amber-950/60 text-amber-200 shadow-sm'
                    : 'border-slate-800 bg-stone-900 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-bold">Warm Amber</div>
                  <div className="text-[10px] text-amber-400/80">Reduces blue-light fatigue</div>
                </div>
              </button>
            </div>
          </div>

          {/* Typography & Readability */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Typography & Dyslexia Support
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <Type className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Dyslexia-Friendly Spacing</div>
                    <div className="text-[11px] text-slate-400">
                      Wider character tracking & relaxed line-height to reduce visual crowding.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dyslexiaFont}
                  onChange={(e) => setDyslexiaFont(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                  aria-label="Toggle dyslexia-friendly font"
                />
              </div>

              {/* Font Size Scaling */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="text-xs font-bold text-slate-200 mb-2">Font Size Scaling</div>
                <div className="flex gap-2">
                  {(['100', '125', '150'] as TextScale[]).map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setTextScale(scale)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition ${
                        textScale === scale
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200 font-bold'
                          : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      {scale === '100' ? 'Regular (100%)' : scale === '125' ? 'Large (125%)' : 'Extra Large (150%)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Easy-Read & Plain Language */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Easy-Read Mode (ELI5)</div>
                <div className="text-[11px] text-slate-400">
                  Rewrites complex algorithms into everyday analogies and clear step-by-step logic.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={easyReadMode}
              onChange={(e) => setEasyReadMode(e.target.checked)}
              className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
              aria-label="Toggle Easy Read Mode"
            />
          </div>

          {/* Text-to-Speech (TTS) Speed & Test */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Screen Reader / Audio Pace</span>
              </div>
              <button
                onClick={() =>
                  speakText(
                    'Welcome to OmniLearn AI. This is a sample audio reading at your chosen speed.'
                  )
                }
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1"
              >
                {isSpeaking ? 'Playing...' : 'Test Voice Audio'}
              </button>
            </div>
            <div className="flex gap-2">
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setTtsRate(speed)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                    ttsRate === speed
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold'
                      : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <ZapOff className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Reduce Motion & Animations</div>
                <div className="text-[11px] text-slate-400">
                  Disables UI animations for learners with vestibular disorders or low-power hardware.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
              aria-label="Toggle reduced motion"
            />
          </div>

          {/* Keyboard Shortcuts Cheat Sheet */}
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Accessibility Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex justify-between p-1.5 rounded bg-slate-900/60">
                <span>Read Aloud:</span>
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  Alt + S
                </kbd>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-900/60">
                <span>Easy-Read:</span>
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  Alt + E
                </kbd>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-900/60">
                <span>Stop Voice:</span>
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  Escape
                </kbd>
              </div>
              <div className="flex justify-between p-1.5 rounded bg-slate-900/60">
                <span>Focus Next:</span>
                <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  Tab
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
