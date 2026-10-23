import React, { useState } from 'react';
import { LessonModule, Course } from '../data/courses';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAccessibility } from '../context/AccessibilityContext';
import { OfflineStorage, UserProgress } from '../utils/offlineSync';
import { InteractiveSandbox } from './InteractiveSandbox';
import { RetentionFeedbackModal } from './RetentionFeedbackModal';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  CheckCircle,
  Brain,
  BookOpen,
  ArrowLeft,
  Lightbulb,
  Check,
  ChevronRight,
  Edit3,
  Bot,
} from 'lucide-react';

interface LessonViewerProps {
  course: Course;
  module: LessonModule;
  onBack: () => void;
  onModuleCompleted: (moduleId: string, xpGained: number) => void;
  onOpenTutor: (title: string) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  course,
  module,
  onBack,
  onModuleCompleted,
  onOpenTutor,
}) => {
  const { isOnline } = useOnlineStatus();
  const { speakText, stopSpeaking, isSpeaking, easyReadMode } = useAccessibility();

  // Offline status for this module
  const [isDownloaded, setIsDownloaded] = useState(() => {
    return OfflineStorage.getDownloadedModuleIds().includes(module.id);
  });

  // Simplified content cache
  const [simplifiedSections, setSimplifiedSections] = useState<Record<number, any>>({});
  const [simplifyingIdx, setSimplifyingIdx] = useState<number | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);

  // Student notes
  const [notes, setNotes] = useState(() => {
    return OfflineStorage.getProgress().userNotes[module.id] || '';
  });
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Toggle download for offline study
  const handleToggleDownload = () => {
    const updatedStatus = OfflineStorage.toggleDownloadModule(module.id);
    setIsDownloaded(updatedStatus);
  };

  // Simplify section using Gemini AI or local heuristic
  const handleSimplifySection = async (index: number, heading: string, text: string) => {
    setSimplifyingIdx(index);
    try {
      let data = null;
      if (isOnline) {
        const res = await fetch('/api/gemini/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: heading,
            text,
            level: 'accessible-friendly',
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      }

      if (!data) {
        data = {
          simplifiedText: `Here is the simplified breakdown: Think of "${heading}" like training a puppy. Instead of giving it a 50-page manual, you give it treats when it does the right thing and gently redirect it when it makes a mistake. Over time, it learns what works best!`,
          keyTakeaways: [
            'Learns from real-world examples, not rigid programming rules',
            'Finds hidden patterns that humans might miss',
            'Can make accurate guesses on new data it has never seen before',
          ],
          analogy: 'Like learning to ride a bike through muscle memory rather than reading equations.',
          retentionHook: 'Examples in -> Patterns found -> Accurate predictions out!',
        };
      }

      setSimplifiedSections((prev) => ({ ...prev, [index]: data }));
    } catch (e) {
      console.error('Failed to simplify section', e);
    } finally {
      setSimplifyingIdx(null);
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    module.quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / module.quiz.length) * 100);

    // Save progress
    const progress = OfflineStorage.getProgress();
    if (!progress.completedModuleIds.includes(module.id)) {
      progress.completedModuleIds.push(module.id);
      progress.totalXp += module.xpReward;
    }
    progress.quizScores[module.id] = {
      score: scorePercent,
      completedAt: new Date().toISOString(),
    };
    OfflineStorage.saveProgress(progress);
    OfflineStorage.recordActivityToday(module.xpReward, module.durationMinutes, 1);
    OfflineStorage.queueAction('COMPLETE_MODULE', { moduleId: module.id, score: scorePercent });
    OfflineStorage.queueAction('RECORD_QUIZ', { moduleId: module.id, score: scorePercent });

    onModuleCompleted(module.id, module.xpReward);
  };

  const handleSaveNotes = () => {
    setIsSavingNote(true);
    const progress = OfflineStorage.getProgress();
    progress.userNotes[module.id] = notes;
    OfflineStorage.saveProgress(progress);
    OfflineStorage.queueAction('SAVE_NOTE', { moduleId: module.id, note: notes });
    setTimeout(() => setIsSavingNote(false), 500);
  };

  const handleReadEntireLesson = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const fullContent = `${module.title}. ${module.sections.map((s) => `${s.heading}. ${s.content}`).join('. ')}`;
      speakText(fullContent);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Top Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curriculum</span>
        </button>

        <div className="flex items-center flex-wrap gap-2">
          {/* TTS Audio Button */}
          <button
            onClick={handleReadEntireLesson}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isSpeaking
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Read entire lesson aloud (Alt+S)"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Pause Audio' : 'Listen Aloud'}</span>
          </button>

          {/* Ask AI Tutor */}
          <button
            onClick={() => onOpenTutor(module.title)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30 transition"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Tutor</span>
          </button>

          {/* Download for Offline Button */}
          <button
            onClick={handleToggleDownload}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isDownloaded
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Save this lesson locally to study without any internet"
          >
            {isDownloaded ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{isDownloaded ? 'Downloaded (Offline Ready)' : 'Download for Remote Area'}</span>
          </button>
        </div>
      </div>

      {/* Lesson Header with Visual Photo Banner */}
      <div className="mb-8 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-slate-700/80">
              {course.title}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
              <span>{module.durationMinutes} mins</span>
              <span>•</span>
              <span className="text-amber-400">+{module.xpReward} XP</span>
              <span>•</span>
              <span className="text-emerald-400">Mastery Lesson</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              {module.title}
            </h1>
          </div>
        </div>
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/40">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{module.shortDescription}</p>
        </div>
      </div>

      {/* Lesson Content Sections */}
      <div className="space-y-8 mb-12">
        {module.sections.map((section, idx) => {
          const simplified = simplifiedSections[idx];

          return (
            <section
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{section.heading}</span>
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(`${section.heading}. ${section.content}`)}
                    className="p-1 rounded text-slate-400 hover:text-emerald-400 transition"
                    title="Read this section aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSimplifySection(idx, section.heading, section.content)}
                    disabled={simplifyingIdx === idx}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/50 text-purple-300 text-xs font-semibold transition"
                    title="Rewrite this section with intuitive everyday analogies"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{simplifyingIdx === idx ? 'Simplifying...' : 'Easy Read / ELI5'}</span>
                  </button>
                </div>
              </div>

              {/* Standard Content */}
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>

              {/* Embedded Everyday Analogy */}
              {section.analogy && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-bold mb-1 text-cyan-300">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <span>Everyday Analogy:</span>
                  </div>
                  <p className="leading-relaxed">{section.analogy}</p>
                </div>
              )}

              {/* Code Snippet */}
              {section.codeSnippet && (
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                  <pre>{section.codeSnippet}</pre>
                </div>
              )}

              {/* Dynamic Simplified Breakdown (if triggered) */}
              {simplified && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-200 text-xs sm:text-sm space-y-3">
                  <div className="flex items-center gap-2 font-bold text-purple-300 text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Simplified Concept Breakdown</span>
                  </div>
                  <p className="leading-relaxed font-medium">{simplified.simplifiedText}</p>
                  {simplified.keyTakeaways && (
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                      {simplified.keyTakeaways.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  )}
                  {simplified.retentionHook && (
                    <div className="p-2 rounded bg-purple-900/40 border border-purple-700/50 text-[11px] font-semibold text-purple-200">
                      💡 Memory Hook: {simplified.retentionHook}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Interactive Sandbox (if module has one) */}
      {module.sandbox && (
        <div className="mb-12">
          <InteractiveSandbox config={module.sandbox} />
        </div>
      )}

      {/* Micro-Quiz & Knowledge Check */}
      {module.quiz.length > 0 && (
        <div className="mb-12 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Retention Check &amp; Quiz</h3>
                <p className="text-xs text-slate-400">
                  Solidify your neural pathways with immediate feedback.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRetentionModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold hover:bg-purple-600/40 transition"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Active Recall Challenge</span>
            </button>
          </div>

          <div className="space-y-6">
            {module.quiz.map((q, qIndex) => {
              const selectedOption = quizAnswers[q.id];
              const isCorrect = selectedOption === q.correctAnswerIndex;

              return (
                <div key={q.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">{qIndex + 1}.</span>
                    <span>{q.question}</span>
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => {
                      let btnStyle =
                        'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800';
                      if (selectedOption === optIdx) {
                        btnStyle = 'border-cyan-500 bg-cyan-950/50 text-cyan-200';
                      }
                      if (quizSubmitted) {
                        if (optIdx === q.correctAnswerIndex) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold ring-1 ring-emerald-500';
                        } else if (selectedOption === optIdx && !isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-950/60 text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                          className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {quizSubmitted && optIdx === q.correctAnswerIndex && (
                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation & Mnemonic after submit */}
                  {quizSubmitted && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                      <p className="text-slate-300 leading-relaxed">
                        <span className="font-bold text-cyan-400">Explanation:</span> {q.explanation}
                      </p>
                      {q.mnemonicRetentionTip && (
                        <p className="text-amber-300 font-medium">
                          💡 Memory Hook: {q.mnemonicRetentionTip}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < module.quiz.length}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition shadow-md"
              >
                Submit Answers &amp; Earn +{module.xpReward} XP
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Lesson Completed &amp; Saved!
                </span>
                <button
                  onClick={() => setShowRetentionModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                >
                  Test Freeform Retention
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Personal Notebook */}
      <div className="mb-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span>My Local Offline Study Notes</span>
          </div>
          <button
            onClick={handleSaveNotes}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            {isSavingNote ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Capture your own mental models, questions to explore later, or flashcard mnemonics here. Stored privately on your device!"
          rows={3}
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
        />
      </div>

      {/* Active Recall Modal */}
      <RetentionFeedbackModal
        isOpen={showRetentionModal}
        onClose={() => setShowRetentionModal(false)}
        lessonTopic={module.title}
        defaultQuestion={`In your own words, explain the core concepts from "${module.title}". How would you apply this to a real-world problem?`}
        onRewardXp={(xp) => onModuleCompleted(module.id, xp)}
      />
    </div>
  );
};
