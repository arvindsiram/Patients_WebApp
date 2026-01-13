import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { AppointmentTable } from './AppointmentTable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Calendar, AlertCircle, LogOut, ArrowLeft } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function Dashboard({ onLogout, onBack, showBackButton = false }: DashboardProps) {
  const { appointments, loading, error, refetch, updateStatus } = useGoogleSheets();

  const handleCancelAppointment = (id: string) => {
    updateStatus(id, 'cancelled');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Patient Appointments
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your healthcare dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Appointments</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? '—' : appointments.length}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '—' : appointments.filter(a => a.status === 'scheduled').length}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '—' : appointments.filter(a => a.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Failed to Load Data
            </h2>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
            <Calendar className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              No Appointments Found
            </h2>
            <p className="text-muted-foreground">
              There are no appointments in the system yet.
            </p>
          </div>
        )}

        {/* Appointments Table */}
        {!loading && !error && appointments.length > 0 && (
          <AppointmentTable
            appointments={appointments}
            onCancelAppointment={handleCancelAppointment}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 py-4">
        <p className="text-center text-xs text-muted-foreground">
          © 2026 HealthCare Dashboard • HIPAA Compliant • All data is encrypted
        </p>
      </footer>
    </div>
  );
}
