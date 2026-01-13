import { Badge } from '@/components/ui/badge';
import { AppointmentStatus } from '@/types/appointment';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium', config.className)}
    >
      {config.label}
    </Badge>
  );
}
