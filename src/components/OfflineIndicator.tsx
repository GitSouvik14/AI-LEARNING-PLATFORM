import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { OfflineStorage, QueuedSyncAction } from '../utils/offlineSync';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isHardwareOnline, isSimulatedOffline, toggleSimulateOffline } = useOnlineStatus();
  const [queuedItems, setQueuedItems] = useState<QueuedSyncAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const refreshQueue = () => {
    setQueuedItems(OfflineStorage.getSyncQueue());
  };

  useEffect(() => {
    refreshQueue();
    const handleQueueChange = () => refreshQueue();
    window.addEventListener('omni_sync_queue_updated', handleQueueChange);
    return () => window.removeEventListener('omni_sync_queue_updated', handleQueueChange);
  }, []);

  // When coming back online, auto-sync queued items!
  useEffect(() => {
    if (isOnline && queuedItems.length > 0) {
      triggerSync();
    }
  }, [isOnline]);

  const triggerSync = async () => {
    if (queuedItems.length === 0) return;
    setIsSyncing(true);
    // Simulate cloud batch sync
    await new Promise((resolve) => setTimeout(resolve, 800));
    OfflineStorage.clearSyncQueue();
    setIsSyncing(false);
    setSyncFeedback(`Successfully synchronized ${queuedItems.length} learning item${queuedItems.length > 1 ? 's' : ''}!`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  return (
    <>
      {/* Floating Connectivity & Remote Status Bar */}
      <div className="fixed bottom-4 left-4 z-40 max-w-sm flex flex-col gap-2">
        {syncFeedback && (
          <div className="flex items-center gap-2 bg-emerald-600 text-white px-3.5 py-2 rounded-xl shadow-lg text-xs font-medium animate-bounce">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-xl text-xs text-slate-200">
          {/* Status Icon */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span>Online (Sync Active)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSimulatedOffline ? 'Simulated Remote Area' : 'Offline Mode'}</span>
              </span>
            )}
          </div>

          {/* Queued Updates Badge */}
          {queuedItems.length > 0 && (
            <button
              onClick={triggerSync}
              disabled={!isOnline || isSyncing}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                isOnline
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
              title={isOnline ? 'Click to sync now' : 'Updates will sync automatically once reconnected'}
            >
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <CloudUpload className="w-3 h-3" />
              )}
              <span>{queuedItems.length} queued</span>
            </button>
          )}

          {/* Quick Simulation Toggle */}
          <button
            onClick={toggleSimulateOffline}
            className={`ml-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded transition ${
              isSimulatedOffline
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
            title="Toggle simulated remote offline mode to test uninterrupted learning with zero connectivity"
          >
            {isSimulatedOffline ? 'Go Online' : 'Simulate Offline'}
          </button>
        </div>
      </div>
    </>
  );
};
