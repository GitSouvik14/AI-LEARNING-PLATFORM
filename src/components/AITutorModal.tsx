import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAccessibility } from '../context/AccessibilityContext';
import { X, Bot, Send, Mic, MicOff, Volume2, Sparkles, User, HelpCircle } from 'lucide-react';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLessonTitle?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  suggestedQuestions?: string[];
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  currentLessonTitle = 'AI & Machine Learning Foundations',
}) => {
  const { isOnline } = useOnlineStatus();
  const {
    speakText,
    isListening,
    hasSpeechSupport,
    startVoiceInput,
    stopVoiceInput,
    easyReadMode,
    dyslexiaFont,
  } = useAccessibility();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'tutor',
      text: `Hello! I'm your accessible AI learning companion. Ask me anything about ${currentLessonTitle}, or request an analogy, step-by-step breakdown, or practice question!`,
      suggestedQuestions: [
        'Can you explain this using an everyday cooking analogy?',
        'What is the difference between supervised and unsupervised learning?',
        'How does backpropagation actually tweak weights?',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let replyData = null;
      if (isOnline) {
        const history = messages.slice(-4).map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

        const res = await fetch('/api/gemini/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history,
            currentLessonTitle,
            accessibilityPreferences: {
              easyRead: easyReadMode,
              dyslexiaFont,
            },
          }),
        });

        if (res.ok) {
          replyData = await res.json();
        }
      }

      if (!replyData) {
        // Offline heuristic fallback response
        replyData = {
          reply: `[Offline Guide for "${currentLessonTitle}"]: Great question! In Machine Learning, the key intuition to remember is that models optimize an error curve (Loss Function). Rather than having a programmer specify each conditional branch, the algorithm iterates over examples and adjusts internal parameters. Keep exploring your downloaded notes or try the interactive sandbox!`,
          suggestedQuestions: [
            'How do weights and biases work together?',
            'What is model overfitting and how do we stop it?',
            'Why is data privacy vital when training models?',
          ],
        };
      }

      const tutorMsg: Message = {
        id: 'msg_tutor_' + Date.now(),
        sender: 'tutor',
        text: replyData.reply,
        suggestedQuestions: replyData.suggestedQuestions,
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (e) {
      console.error('Error contacting tutor', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput((transcript) => {
        setInputText(transcript);
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutor-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="w-full max-w-xl h-[85vh] max-h-[680px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 id="tutor-heading" className="text-sm font-bold text-white flex items-center gap-2">
                <span>OmniLearn AI Tutor</span>
                {isOnline ? (
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                    Online &amp; Active
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                    Offline Mentor
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Context: {currentLessonTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close AI tutor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-xs'
                    : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {m.sender === 'user' ? 'You' : 'OmniLearn Tutor'}
                  </span>
                  {m.sender === 'tutor' && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="text-slate-400 hover:text-cyan-400 p-0.5"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-line">{m.text}</p>
              </div>

              {/* Suggested follow-up chips */}
              {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                  {m.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-[11px] text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-full px-2.5 py-1 text-left transition"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 w-fit">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>OmniLearn Tutor is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or speak using microphone..."
              className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500"
            />

            {hasSpeechSupport && (
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-2.5 rounded-xl border transition ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Voice dictate your question"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold transition"
              aria-label="Send message to AI tutor"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
