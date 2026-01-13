import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { X, AlertCircle } from 'lucide-react';
import { Appointment } from '@/types/appointment';

interface AppointmentActionsProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
}

function canCancelAppointment(date: string, startTime: string): { canCancel: boolean; hoursRemaining: number } {
  const appointmentDateTime = new Date(`${date}T${startTime}`);
  const now = new Date();
  const hoursRemaining = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return {
    canCancel: hoursRemaining >= 6,
    hoursRemaining: Math.max(0, hoursRemaining),
  };
}

export function AppointmentActions({ appointment, onCancel }: AppointmentActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (appointment.status !== 'scheduled') {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const { canCancel, hoursRemaining } = canCancelAppointment(
    appointment.date,
    appointment.start_time
  );

  const handleCancel = () => {
    onCancel(appointment.id);
    setIsDialogOpen(false);
  };

  if (!canCancel) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1">
            <Button variant="outline" size="sm" disabled className="gap-1">
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>Appointments can only be cancelled up to 6 hours in advance.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Time remaining: {hoursRemaining.toFixed(1)} hours
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1">
          <X className="h-3 w-3" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel the appointment for{' '}
            <strong>{appointment.patient_name}</strong> on{' '}
            <strong>{appointment.date}</strong> at{' '}
            <strong>{appointment.start_time}</strong>?
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Yes, Cancel Appointment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
