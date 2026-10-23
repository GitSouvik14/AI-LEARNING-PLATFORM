import React, { useState } from 'react';
import { exportLearningProgressBackup, OfflineStorage, UserProgress } from '../utils/offlineSync';
import {
  Download,
  X,
  FileJson,
  CheckCircle2,
  Copy,
  Upload,
  ShieldCheck,
  Flame,
  Zap,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface ExportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onProgressRestored: (updated: UserProgress) => void;
}

export const ExportBackupModal: React.FC<ExportBackupModalProps> = ({
  isOpen,
  onClose,
  progress,
  onProgressRestored,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const res = exportLearningProgressBackup();
    setDownloadSuccess(`Downloaded "${res.filename}" (${res.sizeKb} KB)`);
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  const handleCopyJson = () => {
    const jsonStr = OfflineStorage.exportDataBackup();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Support both old and new schema format
        const progressData = parsed.progress || parsed.userProfile
          ? {
              totalXp: parsed.userProfile?.totalXp ?? parsed.progress?.totalXp ?? 150,
              streakDays: parsed.userProfile?.streakDays ?? parsed.progress?.streakDays ?? 3,
              lastStudyDate: parsed.userProfile?.lastStudyDate ?? parsed.progress?.lastStudyDate ?? new Date().toISOString().split('T')[0],
              completedModuleIds: parsed.learningProgress?.completedModuleIds ?? parsed.progress?.completedModuleIds ?? [],
              quizScores: parsed.learningProgress?.quizScores ?? parsed.progress?.quizScores ?? {},
              masteredFlashcardIds: parsed.learningProgress?.masteredFlashcardIds ?? parsed.progress?.masteredFlashcardIds ?? [],
              userNotes: parsed.learningProgress?.userNotes ?? parsed.progress?.userNotes ?? {},
              personalizedPath: parsed.learningProgress?.personalizedPath ?? parsed.progress?.personalizedPath,
              dailyActivityHistory: parsed.progress?.dailyActivityHistory,
            }
          : null;

        if (progressData) {
          OfflineStorage.saveProgress(progressData);
          if (parsed.offlineStorage?.downloadedModuleIds) {
            localStorage.setItem(
              'omni_downloaded_modules_v1',
              JSON.stringify(parsed.offlineStorage.downloadedModuleIds)
            );
          }
          onProgressRestored(progressData);
          setImportStatus('Backup restored successfully!');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Invalid backup file format');
        }
      } catch (err) {
        setImportStatus('Failed to parse backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  const previewSnippet = JSON.stringify(
    {
      app: 'OmniLearn AI',
      exportedAt: new Date().toISOString(),
      userProfile: {
        totalXp: progress.totalXp,
        streakDays: progress.streakDays,
        lastStudyDate: progress.lastStudyDate,
      },
      learningProgress: {
        completedModules: progress.completedModuleIds.length,
        notesCount: Object.keys(progress.userNotes || {}).length,
      },
      offlineStorage: {
        cachedModules: OfflineStorage.getDownloadedModuleIds().length,
      },
    },
    null,
    2
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 id="backup-heading" className="text-lg font-bold text-white">
                Offline Backup &amp; Learning Export
              </h2>
              <p className="text-xs text-slate-400">
                Download your learning progress, XP, streak history, and personal notes as JSON.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close backup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {downloadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {importStatus && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Summary Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Total XP
            </div>
            <div className="text-base font-bold text-white mt-0.5">{progress.totalXp} XP</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" /> Streak Days
            </div>
            <div className="text-base font-bold text-white mt-0.5">{progress.streakDays} Days</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-cyan-400" /> Lessons Done
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {progress.completedModuleIds.length} Modules
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> 30-Day Logs
            </div>
            <div className="text-base font-bold text-white mt-0.5">Full History</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-3">
          <button
            onClick={handleDownload}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Offline JSON Backup</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleCopyJson}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition border border-slate-700"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON to Clipboard'}</span>
            </button>

            <label className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Restore from File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* JSON Preview */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
            <span>JSON Payload Preview:</span>
            <span className="font-mono text-[10px] text-slate-500">Schema 2.0</span>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-36 leading-relaxed">
            {previewSnippet}
          </pre>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>100% Client-Side Privacy:</strong> This backup is generated directly in your
            browser. No personal identifiers or data logs are ever transmitted to external servers.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
