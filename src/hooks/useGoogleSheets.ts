import { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { useAuth } from '@/contexts/AuthContext';

// Google Sheets API configuration
const GOOGLE_SHEETS_API_KEY = process.env.API_KEY || '';
const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Extracts spreadsheet ID from a Google Sheets URL
 * Supports formats:
 * - https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
 * - https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid=0
 * - {SPREADSHEET_ID} (direct ID)
 */
function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  
  // If it's already just an ID, return it
  if (!url.includes('/')) return url;
  
  // Extract ID from URL
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export function useGoogleSheets() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    // Check if API key is configured
    if (!GOOGLE_SHEETS_API_KEY) {
      setError('Google Sheets API key is not configured. Please set VITE_GOOGLE_SHEETS_API_KEY environment variable.');
      setLoading(false);
      return;
    }

    // Check if user has a sheet URL
    if (!user?.appointmentsSheetUrl) {
      // Demo data for development - will be replaced with actual Google Sheets data
      setAppointments([
        {
          id: '1',
          patient_name: 'John Doe',
          email: 'john.doe@email.com',
          phone_number: '+1 234 567 8900',
          patient_symptoms: 'Headache, fever',
          report_url: btoa('https://example.com/report1.pdf'),
          date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          start_time: '10:00',
          status: 'scheduled',
        },
        {
          id: '2',
          patient_name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone_number: '+1 234 567 8901',
          patient_symptoms: 'Back pain',
          report_url: btoa('https://example.com/report2.pdf'),
          date: new Date().toISOString().split('T')[0],
          start_time: '14:30',
          status: 'completed',
        },
        {
          id: '3',
          patient_name: 'Bob Johnson',
          email: 'bob.j@email.com',
          phone_number: '+1 234 567 8902',
          patient_symptoms: 'Annual checkup',
          report_url: '',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          start_time: '09:00',
          status: 'scheduled',
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const spreadsheetId = extractSpreadsheetId(user.appointmentsSheetUrl);
      if (!spreadsheetId) {
        throw new Error('Invalid Google Sheets URL format');
      }

      // Fetch data from Google Sheets API v4
      // Assuming the sheet has columns: Patient Name, Email, Phone, Symptoms, Report URL, Date, Start Time, Status
      // Range: Sheet1!A2:H (starting from row 2 to skip header)
      const range = 'Sheet1!A2:H';
      const apiUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse Google Sheets data format
      // Google Sheets API returns { values: [[row1], [row2], ...] }
      const rows = data.values || [];
      const parsedAppointments: Appointment[] = rows.map((row: string[], index: number) => ({
        id: String(index + 1),
        patient_name: row[0] || '',
        email: row[1] || '',
        phone_number: row[2] || '',
        patient_symptoms: row[3] || '',
        report_url: row[4] || '',
        date: row[5] || '',
        start_time: row[6] || '',
        status: (row[7] as AppointmentStatus) || 'scheduled',
      }));
      
      setAppointments(parsedAppointments);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointments. Please try again.';
      setError(errorMessage);
      console.error('Error fetching Google Sheets data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.appointmentsSheetUrl]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    // Update local state immediately for better UX
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status } : apt)
    );

    // Update Google Sheets via API
    if (!GOOGLE_SHEETS_API_KEY || !user?.appointmentsSheetUrl) {
      console.warn('Cannot update Google Sheets: API key or sheet URL not configured');
      return;
    }

    try {
      const spreadsheetId = extractSpreadsheetId(user.appointmentsSheetUrl);
      if (!spreadsheetId) {
        throw new Error('Invalid Google Sheets URL format');
      }

      // Find the row index (add 2 because: 1 for header row, 1 for 0-based index)
      const appointment = appointments.find(apt => apt.id === id);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const rowIndex = appointments.findIndex(apt => apt.id === id) + 2; // +2 for header and 0-based index
      const range = `Sheet1!H${rowIndex}`; // Status column is H (8th column)

      // Update the status cell
      const apiUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${range}?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[status]],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Status updated successfully in Google Sheets');
    } catch (err) {
      console.error('Error updating Google Sheets:', err);
      // Revert local state on error
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? { ...apt, status: appointments.find(a => a.id === id)?.status || 'scheduled' } : apt)
      );
      setError('Failed to update appointment status. Please try again.');
    }
  }, [appointments, user?.appointmentsSheetUrl]);

  return { appointments, loading, error, refetch: fetchAppointments, updateStatus };
}
