/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { COURSES, Course, LessonModule } from './data/courses';
import { OfflineStorage, UserProgress } from './utils/offlineSync';
import { Dashboard } from './components/Dashboard';
import { LessonViewer } from './components/LessonViewer';
import { AccessibilitySettingsModal } from './components/AccessibilitySettingsModal';
import { PersonalizedPathModal } from './components/PersonalizedPathModal';
import { AITutorModal } from './components/AITutorModal';
import { ExportBackupModal } from './components/ExportBackupModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Sparkles,
  Eye,
  Bot,
  Zap,
  Flame,
  BookOpen,
  Volume2,
  VolumeX,
  Compass,
  FileJson,
} from 'lucide-react';

function AppContent() {
  const { isSpeaking, stopSpeaking } = useAccessibility();

  // Progress state
  const [progress, setProgress] = useState<UserProgress>(() => OfflineStorage.getProgress());

  // Active View State: Dashboard vs Lesson
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeModule, setActiveModule] = useState<LessonModule | null>(null);

  // Modals state
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);
  const [showPathwayModal, setShowPathwayModal] = useState(false);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [tutorContext, setTutorContext] = useState<string>('General AI & ML');

  // Handle module completion
  const handleModuleCompleted = (moduleId: string, xpGained: number) => {
    const updated = OfflineStorage.getProgress();
    setProgress({ ...updated });
  };

  const handleSelectModule = (course: Course, module: LessonModule) => {
    setActiveCourse(course);
    setActiveModule(module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveCourse(null);
    setActiveModule(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTutor = (contextTitle?: string) => {
    if (contextTitle) setTutorContext(contextTitle);
    setShowTutorModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Skip to Content for screen reader accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow-xl font-bold text-sm"
      >
        Skip to main content
      </a>

      {/* Primary Accessible Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div
            onClick={handleBackToDashboard}
            className="flex items-center gap-2.5 cursor-pointer group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleBackToDashboard();
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-md group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>OmniLearn</span>
                <span className="text-cyan-400">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Accessible &amp; Offline Skills
              </div>
            </div>
          </div>

          {/* Center / Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button (Mandatory as per skill) */}
            <PWAInstallButton compact />

            {/* Streak & XP Badges */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <span className="flex items-center gap-1 text-orange-400">
                <Flame className="w-3.5 h-3.5" />
                <span>{progress.streakDays}d</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                <span>{progress.totalXp} XP</span>
              </span>
            </div>

            {/* AI Tutor Button */}
            <button
              onClick={() => handleOpenTutor(activeModule ? activeModule.title : undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold transition"
              aria-label="Open AI Tutor mentor"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden md:inline">AI Tutor</span>
            </button>

            {/* Global TTS Stop if speaking */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold animate-pulse"
                title="Stop Audio (Escape)"
              >
                <VolumeX className="w-4 h-4" />
                <span className="hidden md:inline">Stop Voice</span>
              </button>
            )}

            {/* Offline JSON Backup Trigger */}
            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
              aria-label="Export or restore offline JSON backup"
              title="Download user learning progress & streak backup (JSON)"
            >
              <FileJson className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            {/* Accessibility Settings Trigger */}
            <button
              onClick={() => setShowAccessibilityModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
              aria-label="Open accessibility and assistive settings"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Accessibility</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeCourse && activeModule ? (
          <LessonViewer
            course={activeCourse}
            module={activeModule}
            onBack={handleBackToDashboard}
            onModuleCompleted={handleModuleCompleted}
            onOpenTutor={handleOpenTutor}
          />
        ) : (
          <Dashboard
            progress={progress}
            onSelectModule={handleSelectModule}
            onOpenPathwayModal={() => setShowPathwayModal(true)}
            onOpenAccessibilityModal={() => setShowAccessibilityModal(true)}
            onOpenTutor={handleOpenTutor}
            onOpenBackupModal={() => setShowBackupModal(true)}
          />
        )}
      </main>

      {/* Floating Offline Sync Indicator & Status Bar */}
      <OfflineIndicator />

      {/* Accessibility & Assistive Settings Modal */}
      <AccessibilitySettingsModal
        isOpen={showAccessibilityModal}
        onClose={() => setShowAccessibilityModal(false)}
      />

      {/* Personalized AI Pathway Modal */}
      <PersonalizedPathModal
        isOpen={showPathwayModal}
        onClose={() => setShowPathwayModal(false)}
        onPathUpdated={(updated) => setProgress({ ...updated })}
      />

      {/* AI Socratic Tutor Modal */}
      <AITutorModal
        isOpen={showTutorModal}
        onClose={() => setShowTutorModal(false)}
        currentLessonTitle={tutorContext}
      />

      {/* Offline JSON Backup & Progress Export Modal */}
      <ExportBackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        progress={progress}
        onProgressRestored={(updated) => setProgress({ ...updated })}
      />
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
}
