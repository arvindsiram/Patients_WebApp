import { useEffect, useRef } from 'react';
import { startAutoSync, syncAppointments } from '@/services/appointmentSync';

/**
 * Hook to manage appointment syncing
 * Automatically starts syncing when mounted
 */
export function useAppointmentSync(options?: {
  enabled?: boolean;
  intervalMs?: number;
  onSyncComplete?: (stats: { processed: number; synced: number; errors: number }) => void;
}) {
  const {
    enabled = true,
    intervalMs = 30000, // 30 seconds default
    onSyncComplete,
  } = options || {};

  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Start auto-sync
    cleanupRef.current = startAutoSync(intervalMs);

    // Run initial sync and notify
    syncAppointments()
      .then(stats => {
        if (onSyncComplete) {
          onSyncComplete(stats);
        }
      })
      .catch(err => {
        console.error('Initial sync failed:', err);
      });

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [enabled, intervalMs, onSyncComplete]);

  // Manual sync function
  const manualSync = async () => {
    try {
      const stats = await syncAppointments();
      if (onSyncComplete) {
        onSyncComplete(stats);
      }
      return stats;
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    }
  };

  return { manualSync };
}

