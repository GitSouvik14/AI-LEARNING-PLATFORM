import React, { useState } from 'react';
import { COURSES, Course, LessonModule } from '../data/courses';
import { exportLearningProgressBackup, OfflineStorage, UserProgress } from '../utils/offlineSync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ActivityHeatmap } from './ActivityHeatmap';
import {
  Sparkles,
  Zap,
  Flame,
  Award,
  CheckCircle,
  Download,
  BookOpen,
  Compass,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  BrainCircuit,
  Eye,
  Cpu,
  Lock,
  Layers,
  FileJson,
  Check,
  Radio,
  Share2,
} from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onSelectModule: (course: Course, module: LessonModule) => void;
  onOpenPathwayModal: () => void;
  onOpenAccessibilityModal: () => void;
  onOpenTutor: (context?: string) => void;
  onOpenBackupModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  onSelectModule,
  onOpenPathwayModal,
  onOpenAccessibilityModal,
  onOpenTutor,
  onOpenBackupModal,
}) => {
  const { isOnline } = useOnlineStatus();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadedModuleIds, setDownloadedModuleIds] = useState<string[]>(() => {
    return OfflineStorage.getDownloadedModuleIds();
  });
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);

  // Quick Flashcard Review State
  const [activeFlashcardCourse, setActiveFlashcardCourse] = useState<Course | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Calculate overall stats
  const allModules = COURSES.flatMap((c) => c.modules);
  const totalModuleCount = allModules.length;
  const completedCount = progress.completedModuleIds.length;
  const completionPercent = Math.round((completedCount / totalModuleCount) * 100);

  // Category filters
  const categories = [
    { id: 'all', label: 'All AI Domains' },
    { id: 'foundations', label: 'Foundations & Prompts' },
    { id: 'deep_learning', label: 'Neural Networks' },
    { id: 'nlp', label: 'NLP & GenAI' },
    { id: 'vision', label: 'Computer Vision' },
    { id: 'ethics', label: 'Ethics & Privacy' },
    { id: 'edge_ml', label: 'Edge & Offline ML' },
  ];

  const filteredCourses = COURSES.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.modules.some((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Download all curriculum for remote offline study
  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const allIds = allModules.map((m) => m.id);
    OfflineStorage.downloadAllModules(allIds);
    setDownloadedModuleIds(allIds);
    setIsDownloadingAll(false);
    setPrivacyMessage('Entire AI & ML curriculum downloaded locally for 100% offline access!');
    setTimeout(() => setPrivacyMessage(null), 4000);
  };

  // Direct quick export
  const handleQuickExport = () => {
    const res = exportLearningProgressBackup();
    setPrivacyMessage(`Offline backup exported: ${res.filename} (${res.sizeKb} KB)`);
    setTimeout(() => setPrivacyMessage(null), 4000);
  };

  return (
    <div
      className="space-y-8 pb-20 bg-[#000000] border-[#9cafac]"
      style={{ backgroundColor: '#000000', borderColor: '#9cafac' }}
    >
      {/* Privacy Notification Toast */}
      {privacyMessage && (
        <div className="bg-emerald-600/95 text-white p-3.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center justify-between animate-fade-in border border-emerald-400/40">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{privacyMessage}</span>
          </div>
          <button onClick={() => setPrivacyMessage(null)} className="text-white/80 hover:text-white ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Banner with Rich Visual Photography & Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Subtle background photo overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80"
            alt="AI neural network background"
            className="w-full h-full object-cover mix-blend-screen scale-110 blur-xs"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Universal AI &amp; ML Skills for All Learners</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Learn AI Freely, Anywhere on Earth.
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Designed for remote students and learners of all abilities: featuring 100% offline study
            caching, audio voice reading, dyslexia-friendly typography, and Gemini-powered retention coaching.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPathwayModal}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/30 transition active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Customize Learning Pathway</span>
            </button>

            <button
              onClick={() => {
                const firstCourse = COURSES[0];
                onSelectModule(firstCourse, firstCourse.modules[0]);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition border border-slate-700"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Resume Study</span>
            </button>

            <button
              onClick={onOpenBackupModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-800 text-cyan-300 font-semibold text-xs sm:text-sm transition"
              title="Export current user learning progress and streak data as JSON"
            >
              <FileJson className="w-4 h-4" />
              <span>Export Offline Backup</span>
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 font-semibold text-xs sm:text-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingAll ? 'Caching All Modules...' : 'Download All Offline'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total XP */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total XP</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{progress.totalXp}</div>
          <div className="text-[11px] text-slate-400 mt-1">+100 XP per quiz passed</div>
        </div>

        {/* Day Streak */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-orange-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Streak</span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{progress.streakDays} Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Consistent learning</div>
        </div>

        {/* Completed Modules */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Curriculum</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">
            {completedCount}/{totalModuleCount}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-semibold">{completionPercent}% mastered</div>
        </div>

        {/* Offline Cache Status */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Offline Caching</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">
            {downloadedModuleIds.length}/{totalModuleCount}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">Available 100% Offline</div>
        </div>
      </div>

      {/* Visual Activity Heatmap & XP Growth Trajectory (Recharts) */}
      <ActivityHeatmap progress={progress} />

      {/* Visual Showcase: Architectural Pillars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Assistive &amp; Remote Learning Pillars</span>
            </h2>
            <p className="text-xs text-slate-400">
              Built for high performance across diverse hardware, languages, and connectivity levels.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 group hover:border-cyan-700/60 transition shadow-md">
            <div className="h-28 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
                alt="Edge computing chip"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
            <div className="p-3.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Edge &amp; Rural Offline ML</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Quantized inference and local caching allowing students to study without cellular networks.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 group hover:border-purple-700/60 transition shadow-md">
            <div className="h-28 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80"
                alt="Voice and audio assistive learning"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
            <div className="p-3.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-400" />
                <span>WCAG AAA Assistive Suite</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Integrated Web Speech TTS reader, voice input, high-contrast themes, and dyslexia-friendly typography.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 group hover:border-emerald-700/60 transition shadow-md">
            <div className="h-28 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80"
                alt="Neural synaptic connection"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
            <div className="p-3.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <span>Interactive Neural Sandboxes</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Tweak weights, biases, and decision thresholds with live feedback instead of passive memorization.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 group hover:border-amber-700/60 transition shadow-md">
            <div className="h-28 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80"
                alt="Data privacy shield"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
            <div className="p-3.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Zero-Tracker Local Privacy</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Notes, quiz scores, and streak data stay encrypted in your browser with full JSON portability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Pathway Status Card */}
      {progress.personalizedPath && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-bold text-white">
                Active Personalized Pathway: {progress.personalizedPath.goal}
              </h2>
            </div>
            <button
              onClick={onOpenPathwayModal}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline"
            >
              Reconfigure Pathway
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
              Pace: <strong className="text-white">{progress.personalizedPath.dailyMinutes} min/day</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
              Target Level: <strong className="text-white">{progress.personalizedPath.level}</strong>
            </span>
            <span className="text-slate-400">
              Created: {new Date(progress.personalizedPath.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Search & Category Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts (e.g. Backpropagation, Prompting, Convolutions, Privacy, Weights)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                selectedCategory === cat.id
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-200 font-bold shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid with Photographic Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCourses.map((course) => {
          const courseCompletedCount = course.modules.filter((m) =>
            progress.completedModuleIds.includes(m.id)
          ).length;
          const isCourseFullyCompleted = courseCompletedCount === course.modules.length;

          return (
            <div
              key={course.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition group"
            >
              <div>
                {/* Visual Photographic Banner */}
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                  {/* Badges on Banner */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white border border-slate-700/60 shadow">
                      {course.level}
                    </span>
                    {isCourseFullyCompleted && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md text-emerald-400 border border-emerald-700 flex items-center gap-1 shadow">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>

                  {/* Title & Category over banner */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                      {course.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug drop-shadow-sm">
                      {course.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {course.description}
                  </p>

                  {/* Modules List inside Course */}
                  <div className="space-y-2 mb-4">
                    {course.modules.map((mod) => {
                      const isModCompleted = progress.completedModuleIds.includes(mod.id);
                      const isModDownloaded = downloadedModuleIds.includes(mod.id);

                      return (
                        <button
                          key={mod.id}
                          onClick={() => onSelectModule(course, mod)}
                          className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs group/btn ${
                            isModCompleted
                              ? 'border-emerald-800/40 bg-emerald-950/20 text-emerald-200 hover:bg-emerald-950/30'
                              : 'border-slate-800/80 bg-slate-950/50 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isModCompleted ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
                            )}
                            <span className="font-medium group-hover/btn:text-white transition">
                              {mod.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-shrink-0">
                            {isModDownloaded && (
                              <span className="text-emerald-400 flex items-center gap-0.5">
                                <HardDrive className="w-3 h-3" /> Offline
                              </span>
                            )}
                            <span>{mod.durationMinutes}m</span>
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Course Footer & Quick Flashcards */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {courseCompletedCount}/{course.modules.length} lessons finished
                </span>

                <button
                  onClick={() => {
                    setActiveFlashcardCourse(course);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Review Flashcards</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Flashcard Modal Deck */}
      {activeFlashcardCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  Spaced Repetition: {activeFlashcardCourse.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveFlashcardCourse(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Flashcard Body */}
            {(() => {
              const cards = activeFlashcardCourse.modules.flatMap((m) => m.flashcards);
              if (cards.length === 0) {
                return (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No flashcards created for this course yet.
                  </p>
                );
              }
              const card = cards[cardIndex];

              return (
                <div>
                  <div className="text-[10px] text-slate-400 mb-2 flex justify-between">
                    <span>Category: {card.category}</span>
                    <span>
                      Card {cardIndex + 1} of {cards.length}
                    </span>
                  </div>

                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="h-44 p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500/60 transition shadow-inner"
                  >
                    <div className="text-[11px] uppercase font-bold text-slate-500 mb-2">
                      {isFlipped ? 'Answer (Click to Flip)' : 'Concept Prompt (Click to Flip)'}
                    </div>
                    <div className="text-sm font-semibold text-white leading-relaxed">
                      {isFlipped ? card.back : card.front}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setCardIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
                        setIsFlipped(false);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="flex-1 py-2 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 text-xs font-semibold"
                    >
                      Flip Card
                    </button>
                    <button
                      onClick={() => {
                        setCardIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
                        setIsFlipped(false);
                      }}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Data Privacy & Security Footer Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Local Data Privacy &amp; Security Assurance</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          OmniLearn AI operates on a privacy-by-design architecture: your notes, quiz responses,
          and learning profile remain locally encrypted in your browser’s storage. No ads, no
          third-party cookies, and no unauthorized tracking data is ever transmitted.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow transition"
          >
            <FileJson className="w-4 h-4" />
            <span>Manage Offline Backups (JSON)</span>
          </button>

          <button
            onClick={handleQuickExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>1-Click Export</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear your local learning progress? This cannot be undone.')) {
                OfflineStorage.clearAllData();
                window.location.reload();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
          >
            Clear Local Data
          </button>
        </div>
      </div>
    </div>
  );
};
