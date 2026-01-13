/**
 * Appointment Sync Service
 * 
 * Monitors Spreadsheet1 (main appointments sheet) for updates and syncs
 * appointments to individual user spreadsheets based on email matching.
 */

const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
const GOOGLE_SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// Spreadsheet IDs from environment variables or hardcoded
const MAIN_APPOINTMENTS_SHEET_ID = import.meta.env.VITE_MAIN_APPOINTMENTS_SHEET_ID || '1CsN2iqFZAXStQA-xqBO_OIEFeAGIMO2rTy_g_W0rNXU';
const USERS_SHEET_ID = import.meta.env.VITE_USERS_SHEET_ID || '1xftkSFbQbdMl4XIevPPJdYB0vqW7JJtL6HHh9CxkTPI';

/**
 * Extracts spreadsheet ID from a Google Sheets URL
 */
function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  if (!url.includes('/')) return url;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Gets the last processed row number from localStorage
 */
function getLastProcessedRow(): number {
  const stored = localStorage.getItem('last_processed_appointment_row');
  return stored ? parseInt(stored, 10) : 1; // Start from row 1 (header row)
}

/**
 * Saves the last processed row number to localStorage
 */
function setLastProcessedRow(rowNumber: number): void {
  localStorage.setItem('last_processed_appointment_row', rowNumber.toString());
}

/**
 * Fetches all users from Spreadsheet2 (Users_Appointments)
 * Returns a map of email -> spreadsheetId
 */
async function fetchUsersMap(): Promise<Map<string, string>> {
  if (!GOOGLE_SHEETS_API_KEY) {
    console.warn('Google Sheets API key not configured');
    return new Map();
  }

  const spreadsheetId = extractSpreadsheetId(USERS_SHEET_ID);
  if (!spreadsheetId) {
    throw new Error('Invalid users sheet ID format');
  }

  // Fetch users data: email (A), password (B), spreadhseetid (C)
  const range = 'Sheet1!A2:C';
  const apiUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const rows = data.values || [];
  
  // Create map: email -> spreadsheetId
  const usersMap = new Map<string, string>();
  rows.forEach((row: string[]) => {
    if (row[0] && row[2]) { // email and spreadsheetId
      usersMap.set(row[0].toLowerCase().trim(), row[2].trim());
    }
  });

  return usersMap;
}

/**
 * Fetches new appointments from Spreadsheet1 (main appointments sheet)
 * Returns appointments that haven't been processed yet
 */
async function fetchNewAppointments(): Promise<Array<{
  rowIndex: number;
  patientName: string;
  email: string;
  phoneNumber: string;
  reportUrl: string;
  date: string;
  startTime: string;
  status: string;
}>> {
  if (!GOOGLE_SHEETS_API_KEY) {
    console.warn('Google Sheets API key not configured');
    return [];
  }

  const spreadsheetId = extractSpreadsheetId(MAIN_APPOINTMENTS_SHEET_ID);
  if (!spreadsheetId) {
    throw new Error('Invalid main appointments sheet ID format');
  }

  const lastProcessedRow = getLastProcessedRow();
  
  // Fetch all rows from the last processed row onwards
  // Columns: Patient Name (A), Email (B), Phone Number (C), Report URL (D), date (E), start_time (F), status (G)
  const startRow = lastProcessedRow + 1;
  const range = `Sheet1!A${startRow}:G`;
  const apiUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const rows = data.values || [];
  
  // Parse appointments
  const appointments = rows.map((row: string[], index: number) => ({
    rowIndex: startRow + index,
    patientName: row[0] || '',
    email: (row[1] || '').toLowerCase().trim(),
    phoneNumber: row[2] || '',
    reportUrl: row[3] || '',
    date: row[4] || '',
    startTime: row[5] || '',
    status: row[6] || 'scheduled',
  })).filter(apt => apt.email && apt.patientName); // Filter out empty rows

  return appointments;
}

/**
 * Appends an appointment to a user's spreadsheet
 */
async function appendAppointmentToUserSheet(
  userSpreadsheetId: string,
  appointment: {
    patientName: string;
    email: string;
    phoneNumber: string;
    reportUrl: string;
    date: string;
    startTime: string;
    status: string;
  }
): Promise<void> {
  if (!GOOGLE_SHEETS_API_KEY) {
    throw new Error('Google Sheets API key not configured');
  }

  const spreadsheetId = extractSpreadsheetId(userSpreadsheetId);
  if (!spreadsheetId) {
    throw new Error('Invalid user spreadsheet ID format');
  }

  // First, get the current number of rows to find the next available row
  const checkRange = 'Sheet1!A:A';
  const checkUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${checkRange}?key=${GOOGLE_SHEETS_API_KEY}`;
  
  const checkResponse = await fetch(checkUrl);
  if (!checkResponse.ok) {
    const errorData = await checkResponse.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP error! status: ${checkResponse.status}`);
  }

  const checkData = await checkResponse.json();
  const existingRows = checkData.values || [];
  const nextRow = existingRows.length + 1;

  // Append the appointment row
  // Columns: Patient Name (A), Email (B), Phone Number (C), Report URL (D), date (E), start_time (F), status (G)
  const appendRange = `Sheet1!A${nextRow}:G${nextRow}`;
  const appendUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${appendRange}?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
  
  const appendResponse = await fetch(appendUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [[
        appointment.patientName,
        appointment.email,
        appointment.phoneNumber,
        appointment.reportUrl,
        appointment.date,
        appointment.startTime,
        appointment.status,
      ]],
    }),
  });

  if (!appendResponse.ok) {
    const errorData = await appendResponse.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP error! status: ${appendResponse.status}`);
  }
}

/**
 * Main sync function: processes new appointments and syncs them to user spreadsheets
 */
export async function syncAppointments(): Promise<{
  processed: number;
  synced: number;
  errors: number;
}> {
  const stats = {
    processed: 0,
    synced: 0,
    errors: 0,
  };

  try {
    // Fetch new appointments from Spreadsheet1
    const newAppointments = await fetchNewAppointments();
    
    if (newAppointments.length === 0) {
      return stats;
    }

    // Fetch users map from Spreadsheet2
    const usersMap = await fetchUsersMap();

    // Process each appointment
    for (const appointment of newAppointments) {
      stats.processed++;
      
      try {
        // Find matching user by email
        const userSpreadsheetId = usersMap.get(appointment.email);
        
        if (!userSpreadsheetId) {
          console.warn(`No user found for email: ${appointment.email}`);
          stats.errors++;
          continue;
        }

        // Append appointment to user's spreadsheet
        await appendAppointmentToUserSheet(userSpreadsheetId, appointment);
        stats.synced++;
        
        console.log(`Synced appointment for ${appointment.email} to spreadsheet ${userSpreadsheetId}`);
      } catch (error) {
        console.error(`Error syncing appointment for ${appointment.email}:`, error);
        stats.errors++;
      }

      // Update last processed row
      setLastProcessedRow(appointment.rowIndex);
    }

    return stats;
  } catch (error) {
    console.error('Error in syncAppointments:', error);
    throw error;
  }
}

/**
 * Starts automatic syncing with polling
 * @param intervalMs - Polling interval in milliseconds (default: 30 seconds)
 */
export function startAutoSync(intervalMs: number = 30000): () => void {
  console.log(`Starting auto-sync with interval: ${intervalMs}ms`);
  
  // Run initial sync
  syncAppointments().catch(err => {
    console.error('Initial sync failed:', err);
  });

  // Set up polling
  const intervalId = setInterval(() => {
    syncAppointments().catch(err => {
      console.error('Auto-sync failed:', err);
    });
  }, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('Auto-sync stopped');
  };
}

