import { useEffect, useState } from 'react';
import { OfflineStorage } from '../utils/offlineSync';

export function useOnlineStatus() {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(() => {
    return OfflineStorage.getSimulatedOffline();
  });

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    const handleConnectivityChange = () => {
      setSimulatedOffline(OfflineStorage.getSimulatedOffline());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('omni_connectivity_change', handleConnectivityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('omni_connectivity_change', handleConnectivityChange);
    };
  }, []);

  // Effective online status is false if browser is offline OR user turned on simulated remote offline mode
  const isEffectiveOnline = browserOnline && !simulatedOffline;

  const toggleSimulateOffline = () => {
    const nextVal = !simulatedOffline;
    OfflineStorage.setSimulatedOffline(nextVal);
    setSimulatedOffline(nextVal);
  };

  return {
    isOnline: isEffectiveOnline,
    isHardwareOnline: browserOnline,
    isSimulatedOffline: simulatedOffline,
    toggleSimulateOffline,
  };
}
