import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAccessibility } from '../context/AccessibilityContext';
import { OfflineStorage } from '../utils/offlineSync';
import {
  X,
  Brain,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react';

interface RetentionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTopic: string;
  defaultQuestion?: string;
  onRewardXp?: (xp: number) => void;
}

export const RetentionFeedbackModal: React.FC<RetentionFeedbackModalProps> = ({
  isOpen,
  onClose,
  lessonTopic,
  defaultQuestion = 'In your own words, explain how an AI model learns from examples rather than hand-coded rules.',
  onRewardXp,
}) => {
  const { isOnline } = useOnlineStatus();
  const { isListening, hasSpeechSupport, startVoiceInput, stopVoiceInput, speakText } = useAccessibility();

  const [studentAnswer, setStudentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVoiceToggle = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      setVoiceError(null);
      startVoiceInput(
        (transcript) => {
          setStudentAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => setVoiceError(err)
      );
    }
  };

  const handleEvaluate = async () => {
    if (!studentAnswer.trim()) return;
    setIsLoading(true);

    try {
      let data = null;
      if (isOnline) {
        const res = await fetch('/api/gemini/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonTopic,
            question: defaultQuestion,
            studentAnswer,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      }

      if (!data) {
        // Smart offline retention evaluation
        const words = studentAnswer.toLowerCase();
        const hasKeyTerms =
          words.includes('data') ||
          words.includes('pattern') ||
          words.includes('weights') ||
          words.includes('example') ||
          words.includes('learn');

        data = {
          isAccurate: hasKeyTerms,
          score: hasKeyTerms ? 90 : 70,
          positiveEncouragement: hasKeyTerms
            ? 'Phenomenal explanation! You demonstrated how machine learning shifts from hardcoded logic to finding data patterns.'
            : 'Good effort putting this in your own words! Formulating ideas yourself boosts retention by up to 50%.',
          feedbackNotes: hasKeyTerms
            ? 'You captured the main idea well. Keep in mind that as the training data changes, the model adjusts its internal weights to minimize loss.'
            : 'To make this explanation even stronger, mention how the model compares its guess to the true label and tweaks its weights to get closer each time.',
          retentionTips: 'Mnemonic: "D.E.W." -> Data in, Error measured, Weights tuned!',
          spacedRepetitionQuestion: 'Why does testing on fresh, unseen data prove genuine learning?',
          isFallback: !isOnline,
        };
      }

      setFeedback(data);

      // Reward XP for active recall
      if (onRewardXp) {
        onRewardXp(50);
      }
    } catch (e) {
      console.error('Error generating feedback', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!feedback) return;
    const progress = OfflineStorage.getProgress();
    const existing = progress.userNotes[lessonTopic] || '';
    const noteEntry = `\n[AI Retention Note]: ${feedback.retentionTips || feedback.feedbackNotes}`;
    progress.userNotes[lessonTopic] = (existing + noteEntry).trim();
    OfflineStorage.saveProgress(progress);
    OfflineStorage.queueAction('SAVE_NOTE', { topic: lessonTopic, note: noteEntry });
    alert('Saved retention note to your local notebook!');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retention-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 id="retention-heading" className="text-lg font-bold text-white">
                Personalized AI Retention Feedback
              </h2>
              <p className="text-xs text-slate-400">
                Active recall &amp; cognitive consolidation for {lessonTopic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close retention feedback"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!feedback ? (
          <div className="mt-5 space-y-4">
            {/* Prompt Question */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
                <HelpCircle className="w-4 h-4" />
                <span>Active Recall Challenge</span>
              </div>
              <p className="text-sm font-medium text-slate-200">{defaultQuestion}</p>
            </div>

            {/* Answer Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Your Explanation (Type or use Voice):
                </label>
                {hasSpeechSupport && (
                  <button
                    onClick={handleVoiceToggle}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                  </button>
                )}
              </div>

              {voiceError && <p className="text-xs text-rose-400 mb-2">{voiceError}</p>}

              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Explain the idea like you are teaching a friend. Don't worry about perfection—putting it in your own words cements memory!"
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-slate-100 placeholder:text-slate-500 resize-none"
              />
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isLoading || !studentAnswer.trim()}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Conceptual Retention...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Get Personalized Feedback (+50 XP)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Score & Encouragement */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-cyan-400">{feedback.score}%</span>
                  <span className="text-xs font-semibold text-slate-400">Retention Score</span>
                </div>
                <button
                  onClick={() =>
                    speakText(
                      `${feedback.positiveEncouragement}. ${feedback.feedbackNotes}. Retention tip: ${feedback.retentionTips}`
                    )
                  }
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline"
                >
                  Listen Aloud
                </button>
              </div>

              <p className="mt-2 text-sm font-semibold text-emerald-300">
                {feedback.positiveEncouragement}
              </p>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                {feedback.feedbackNotes}
              </p>
            </div>

            {/* Retention Hook */}
            {feedback.retentionTips && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Memory Hook / Retention Formula</span>
                </div>
                <p className="leading-relaxed">{feedback.retentionTips}</p>
              </div>
            )}

            {/* Spaced Repetition Follow-up */}
            {feedback.spacedRepetitionQuestion && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs">
                <span className="font-bold">Follow-Up Retention Challenge:</span>{' '}
                {feedback.spacedRepetitionQuestion}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleSaveToNotes}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
              >
                <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                <span>Save to Notebook</span>
              </button>

              <button
                onClick={() => {
                  setFeedback(null);
                  setStudentAnswer('');
                }}
                className="py-2 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition shadow-sm"
              >
                Continue Lesson
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
