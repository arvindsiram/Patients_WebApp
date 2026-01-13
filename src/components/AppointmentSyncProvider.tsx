import { useAppointmentSync } from '@/hooks/useAppointmentSync';

/**
 * Component that initializes appointment syncing in the background
 * This monitors Spreadsheet1 and syncs appointments to user spreadsheets
 */
export function AppointmentSyncProvider() {
  useAppointmentSync({
    enabled: true,
    intervalMs: 30000, // Check every 30 seconds
    onSyncComplete: (stats) => {
      if (stats.synced > 0 || stats.errors > 0) {
        console.log(`Appointment sync completed: ${stats.synced} synced, ${stats.errors} errors`);
      }
    },
  });

  // This component doesn't render anything
  return null;
}

