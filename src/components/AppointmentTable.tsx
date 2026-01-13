import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Appointment } from '@/types/appointment';
import { StatusBadge } from './StatusBadge';
import { ReportPreview } from './ReportPreview';
import { AppointmentActions } from './AppointmentActions';
import { Mail, Phone, Calendar, Clock } from 'lucide-react';

interface AppointmentTableProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
}

export function AppointmentTable({ appointments, onCancelAppointment }: AppointmentTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Patient Name</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Symptoms</TableHead>
            <TableHead className="font-semibold">Appointment</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Report</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">
                {appointment.patient_name}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {appointment.email}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {appointment.phone_number}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="line-clamp-2 max-w-[200px] text-sm">
                  {appointment.patient_symptoms}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {appointment.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {appointment.start_time}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={appointment.status} />
              </TableCell>
              <TableCell>
                <ReportPreview reportUrl={appointment.report_url} />
              </TableCell>
              <TableCell>
                <AppointmentActions
                  appointment={appointment}
                  onCancel={onCancelAppointment}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
