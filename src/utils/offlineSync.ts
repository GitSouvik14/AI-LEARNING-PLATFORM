/**
 * OmniLearn AI - Offline-First Sync & Storage Engine
 * Manages local persistent data, offline caching for remote students,
 * privacy-preserving local storage, and automatic queue synchronization.
 */

export interface UserProgress {
  totalXp: number;
  streakDays: number;
  lastStudyDate: string;
  completedModuleIds: string[];
  quizScores: Record<string, { score: number; completedAt: string }>;
  masteredFlashcardIds: string[];
  userNotes: Record<string, string>; // moduleId -> note
  dailyActivityHistory?: Record<string, { xp: number; minutes: number; lessons: number }>;
  personalizedPath?: {
    goal: string;
    level: string;
    dailyMinutes: number;
    recommendedModules: string[];
    createdAt: string;
  };
}

export interface DailyActivityRecord {
  date: string;
  shortDate: string;
  dayName: string;
  dayOfMonth: number;
  xpGained: number;
  minutesStudied: number;
  cumulativeXp: number;
  lessonsCompleted: number;
  level: 0 | 1 | 2 | 3; // for heatmap visualization
}

export interface QueuedSyncAction {
  id: string;
  actionType: 'COMPLETE_MODULE' | 'RECORD_QUIZ' | 'SAVE_NOTE' | 'SAVE_PATH' | 'MASTER_FLASHCARD';
  payload: any;
  timestamp: string;
}

const STORAGE_KEYS = {
  PROGRESS: 'omni_user_progress_v1',
  SYNC_QUEUE: 'omni_offline_sync_queue_v1',
  DOWNLOADED_MODULES: 'omni_downloaded_modules_v1',
  SIMULATED_OFFLINE: 'omni_simulated_offline_mode',
  LAST_SYNC_TIME: 'omni_last_sync_timestamp',
};

// Initial default student progress
export const DEFAULT_USER_PROGRESS: UserProgress = {
  totalXp: 150,
  streakDays: 3,
  lastStudyDate: new Date().toISOString().split('T')[0],
  completedModuleIds: ['mod-1-1'],
  quizScores: {
    'mod-1-1': { score: 100, completedAt: new Date().toISOString() },
  },
  masteredFlashcardIds: ['fc-1-1'],
  userNotes: {
    'mod-1-1': 'Traditional code = explicit rules. Machine Learning = learns rules from patterns in data.',
  },
  personalizedPath: {
    goal: 'Build Practical AI Skills for Remote Work',
    level: 'Beginner',
    dailyMinutes: 20,
    recommendedModules: ['mod-1-1', 'mod-1-2', 'mod-2-1', 'mod-5-1', 'mod-6-1'],
    createdAt: new Date().toISOString(),
  },
};

export class OfflineStorage {
  // Load progress from localStorage safely
  static getProgress(): UserProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) return DEFAULT_USER_PROGRESS;
      return { ...DEFAULT_USER_PROGRESS, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Could not read user progress from localStorage', e);
      return DEFAULT_USER_PROGRESS;
    }
  }

  // Save progress locally
  static saveProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress to localStorage', e);
    }
  }

  // Get list of downloaded modules (available 100% offline)
  static getDownloadedModuleIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOWNLOADED_MODULES);
      if (!data) return ['mod-1-1', 'mod-1-2', 'mod-2-1', 'mod-5-1', 'mod-6-1']; // Pre-cached default essentials
      return JSON.parse(data);
    } catch {
      return ['mod-1-1'];
    }
  }

  // Toggle or download module
  static toggleDownloadModule(moduleId: string): boolean {
    try {
      const current = this.getDownloadedModuleIds();
      let updated: string[];
      let isDownloaded = false;
      if (current.includes(moduleId)) {
        updated = current.filter((id) => id !== moduleId);
        isDownloaded = false;
      } else {
        updated = [...current, moduleId];
        isDownloaded = true;
      }
      localStorage.setItem(STORAGE_KEYS.DOWNLOADED_MODULES, JSON.stringify(updated));
      return isDownloaded;
    } catch (e) {
      console.error('Failed to toggle module download', e);
      return false;
    }
  }

  // Download all curriculum for remote offline study
  static downloadAllModules(allModuleIds: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOWNLOADED_MODULES, JSON.stringify(allModuleIds));
    } catch (e) {
      console.error('Failed to download all modules', e);
    }
  }

  // Queue an action to sync once back online
  static queueAction(actionType: QueuedSyncAction['actionType'], payload: any): void {
    try {
      const queue = this.getSyncQueue();
      const newAction: QueuedSyncAction = {
        id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        actionType,
        payload,
        timestamp: new Date().toISOString(),
      };
      queue.push(newAction);
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('omni_sync_queue_updated'));
    } catch (e) {
      console.error('Failed to queue offline sync action', e);
    }
  }

  static getSyncQueue(): QueuedSyncAction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clearSyncQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
      window.dispatchEvent(new CustomEvent('omni_sync_queue_updated'));
    } catch (e) {
      console.error('Failed to clear sync queue', e);
    }
  }

  static getLastSyncTime(): string {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || 'Just now';
  }

  // Simulated Offline Mode (for students to test low connectivity behavior)
  static getSimulatedOffline(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
  }

  static setSimulatedOffline(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, val ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('omni_connectivity_change'));
  }

  // Complete data export for privacy & backup
  static exportDataBackup(): string {
    const backup = {
      progress: this.getProgress(),
      downloadedModules: this.getDownloadedModuleIds(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(backup, null, 2);
  }

  // Complete offline backup generator with direct download
  static triggerDownloadBackup(): { filename: string; sizeKb: string; backupData: any } {
    return exportLearningProgressBackup();
  }

  // Import data backup
  static importDataBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.progress) {
        this.saveProgress(parsed.progress);
        if (parsed.downloadedModules) {
          localStorage.setItem(STORAGE_KEYS.DOWNLOADED_MODULES, JSON.stringify(parsed.downloadedModules));
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid backup file', e);
      return false;
    }
  }

  // Generate 30-day activity heatmap & XP growth trajectory
  static getActivityHistory(progress: UserProgress): DailyActivityRecord[] {
    const records: DailyActivityRecord[] = [];
    const today = new Date();
    const historyMap = progress.dailyActivityHistory || {};
    const totalXp = Math.max(progress.totalXp, 150);

    const rawDays: {
      date: string;
      shortDate: string;
      dayName: string;
      dayOfMonth: number;
      xpGained: number;
      minutesStudied: number;
      lessonsCompleted: number;
    }[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayOfMonth = d.getDate();

      let xp = 0;
      let minutes = 0;
      let lessons = 0;

      if (historyMap[dateStr]) {
        xp = historyMap[dateStr].xp;
        minutes = historyMap[dateStr].minutes;
        lessons = historyMap[dateStr].lessons;
      } else {
        if (i < progress.streakDays) {
          xp = i === 0 ? 50 : 35 + i * 10;
          minutes = 15 + i * 5;
          lessons = 1;
        } else if (i % 3 === 0 || i % 7 === 1) {
          xp = 25 + ((i * 7) % 35);
          minutes = 10 + ((i * 3) % 15);
          lessons = i % 6 === 0 ? 1 : 0;
        }
      }

      rawDays.push({
        date: dateStr,
        shortDate,
        dayName,
        dayOfMonth,
        xpGained: xp,
        minutesStudied: minutes,
        lessonsCompleted: lessons,
      });
    }

    let runningXp = Math.max(0, totalXp - rawDays.reduce((acc, d) => acc + d.xpGained, 0));
    for (const day of rawDays) {
      runningXp += day.xpGained;

      let level: 0 | 1 | 2 | 3 = 0;
      if (day.xpGained >= 55 || day.minutesStudied >= 25) level = 3;
      else if (day.xpGained >= 30 || day.minutesStudied >= 15) level = 2;
      else if (day.xpGained > 0 || day.minutesStudied > 0) level = 1;

      records.push({
        ...day,
        cumulativeXp: runningXp,
        level,
      });
    }

    if (records.length > 0) {
      records[records.length - 1].cumulativeXp = totalXp;
    }

    return records;
  }

  // Record daily study activity
  static recordActivityToday(xp: number, minutes: number = 15, lessons: number = 1): void {
    const progress = this.getProgress();
    const todayStr = new Date().toISOString().split('T')[0];
    if (!progress.dailyActivityHistory) {
      progress.dailyActivityHistory = {};
    }
    const current = progress.dailyActivityHistory[todayStr] || { xp: 0, minutes: 0, lessons: 0 };
    progress.dailyActivityHistory[todayStr] = {
      xp: current.xp + xp,
      minutes: current.minutes + minutes,
      lessons: current.lessons + lessons,
    };
    progress.lastStudyDate = todayStr;
    this.saveProgress(progress);
  }

  // Clear all local progress (Privacy compliance)
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.DOWNLOADED_MODULES);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC_TIME);
  }
}

/**
 * Exports the current user learning progress and streak data as a downloadable JSON file for offline backups
 */
export function exportLearningProgressBackup(): {
  success: boolean;
  filename: string;
  sizeKb: string;
  backupData: any;
} {
  const progress = OfflineStorage.getProgress();
  const downloaded = OfflineStorage.getDownloadedModuleIds();
  const activityHistory = OfflineStorage.getActivityHistory(progress);

  const backupObject = {
    app: 'OmniLearn AI',
    backupType: 'OmniLearn Complete User Progress & Streak Archive',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    userProfile: {
      totalXp: progress.totalXp,
      streakDays: progress.streakDays,
      lastStudyDate: progress.lastStudyDate,
    },
    learningProgress: {
      completedModulesCount: progress.completedModuleIds.length,
      completedModuleIds: progress.completedModuleIds,
      quizScores: progress.quizScores,
      masteredFlashcardIds: progress.masteredFlashcardIds,
      userNotes: progress.userNotes,
      personalizedPath: progress.personalizedPath,
    },
    activityHistory30Days: activityHistory,
    offlineStorage: {
      downloadedModuleIds: downloaded,
      downloadedModulesCount: downloaded.length,
    },
  };

  const jsonStr = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const filename = `omnilearn-backup-${new Date().toISOString().split('T')[0]}-${progress.streakDays}days-${progress.totalXp}xp.json`;

  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const sizeKb = (new Blob([jsonStr]).size / 1024).toFixed(2);
  return {
    success: true,
    filename,
    sizeKb,
    backupData: backupObject,
  };
}
