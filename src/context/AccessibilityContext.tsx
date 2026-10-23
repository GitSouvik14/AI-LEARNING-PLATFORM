import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ContrastTheme = 'dark' | 'high-contrast-dark' | 'high-contrast-light' | 'warm-amber';
export type TextScale = '100' | '125' | '150';

interface AccessibilityContextType {
  theme: ContrastTheme;
  setTheme: (theme: ContrastTheme) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (val: boolean) => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  easyReadMode: boolean;
  setEasyReadMode: (val: boolean) => void;
  // Text-To-Speech (TTS)
  isSpeaking: boolean;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  ttsRate: number;
  setTtsRate: (rate: number) => void;
  // Speech Recognition (Voice Input)
  isListening: boolean;
  hasSpeechSupport: boolean;
  startVoiceInput: (onResult: (text: string) => void, onError?: (err: string) => void) => void;
  stopVoiceInput: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const PREFS_KEY = 'omni_accessibility_prefs_v1';

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved preferences
  const [theme, setThemeState] = useState<ContrastTheme>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return JSON.parse(saved).theme || 'dark';
    } catch {}
    return 'dark';
  });

  const [dyslexiaFont, setDyslexiaFontState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return !!JSON.parse(saved).dyslexiaFont;
    } catch {}
    return false;
  });

  const [textScale, setTextScaleState] = useState<TextScale>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return JSON.parse(saved).textScale || '100';
    } catch {}
    return '100';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return !!JSON.parse(saved).reducedMotion;
    } catch {}
    return false;
  });

  const [easyReadMode, setEasyReadModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return !!JSON.parse(saved).easyReadMode;
    } catch {}
    return false;
  });

  const [ttsRate, setTtsRateState] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Save changes to localStorage
  const savePrefs = (updates: Record<string, any>) => {
    try {
      const current = localStorage.getItem(PREFS_KEY);
      const obj = current ? JSON.parse(current) : {};
      localStorage.setItem(PREFS_KEY, JSON.stringify({ ...obj, ...updates }));
    } catch (e) {
      console.warn('Failed to save accessibility preferences', e);
    }
  };

  const setTheme = (t: ContrastTheme) => {
    setThemeState(t);
    savePrefs({ theme: t });
  };

  const setDyslexiaFont = (v: boolean) => {
    setDyslexiaFontState(v);
    savePrefs({ dyslexiaFont: v });
  };

  const setTextScale = (s: TextScale) => {
    setTextScaleState(s);
    savePrefs({ textScale: s });
  };

  const setReducedMotion = (v: boolean) => {
    setReducedMotionState(v);
    savePrefs({ reducedMotion: v });
  };

  const setEasyReadMode = (v: boolean) => {
    setEasyReadModeState(v);
    savePrefs({ easyReadMode: v });
  };

  const setTtsRate = (r: number) => {
    setTtsRateState(r);
  };

  // Sync DOM classes with settings
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Clear previous theme classes
    root.classList.remove('theme-high-contrast-dark', 'theme-high-contrast-light', 'theme-warm-amber');
    if (theme !== 'dark') {
      root.classList.add(`theme-${theme}`);
    }

    // Text scale
    root.classList.remove('text-scale-100', 'text-scale-125', 'text-scale-150');
    root.classList.add(`text-scale-${textScale}`);

    // Dyslexia font
    if (dyslexiaFont) {
      body.classList.add('font-dyslexic');
    } else {
      body.classList.remove('font-dyslexic');
    }

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [theme, dyslexiaFont, textScale, reducedMotion]);

  // Offline Web Speech API TTS
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this environment');
      return;
    }

    window.speechSynthesis.cancel();
    if (!text || text.trim() === '') {
      setIsSpeaking(false);
      return;
    }

    // Clean markdown code ticks or formatting for natural audio reading
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted for reading.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~>]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = ttsRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speech-to-Text (STT) for hands-free typing
  const SpeechRecognition = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const hasSpeechSupport = !!SpeechRecognition;
  let recognitionInstance: any = null;

  const startVoiceInput = (
    onResult: (text: string) => void,
    onError?: (err: string) => void
  ) => {
    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };
      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error', e);
        setIsListening(false);
        if (onError) onError(e.error || 'Voice input failed');
      };
      recognition.onend = () => setIsListening(false);

      recognitionInstance = recognition;
      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      if (onError) onError(e.message || 'Could not start voice input');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Keyboard accessibility listeners (e.g., Alt+S to speak selection)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + S = Read aloud selected text or main content
      if (e.altKey && e.code === 'KeyS') {
        e.preventDefault();
        const selection = window.getSelection()?.toString();
        if (selection && selection.trim().length > 0) {
          speakText(selection);
        } else {
          const mainHeading = document.querySelector('h1, h2')?.textContent || 'OmniLearn AI Accessible Learning Platform';
          speakText(mainHeading);
        }
      }
      // Alt + E = Toggle Easy Read Mode
      if (e.altKey && e.code === 'KeyE') {
        e.preventDefault();
        setEasyReadModeState((prev) => {
          savePrefs({ easyReadMode: !prev });
          return !prev;
        });
      }
      // Escape = Stop any speaking
      if (e.key === 'Escape') {
        stopSpeaking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ttsRate]);

  return (
    <AccessibilityContext.Provider
      value={{
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
        isSpeaking,
        speakText,
        stopSpeaking,
        ttsRate,
        setTtsRate,
        isListening,
        hasSpeechSupport,
        startVoiceInput,
        stopVoiceInput,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
