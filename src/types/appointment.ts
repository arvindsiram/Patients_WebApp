export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_name: string;
  email: string;
  phone_number: string;
  patient_symptoms: string;
  report_url: string;
  date: string;
  start_time: string;
  status: AppointmentStatus;
}
