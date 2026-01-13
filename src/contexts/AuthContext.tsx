import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserCredentials } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: UserCredentials) => Promise<boolean>;
  register: (credentials: UserCredentials) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google Sheets API configuration
const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';
const GOOGLE_SHEETS_API_BASE = 'https://docs.google.com/spreadsheets/d/1xftkSFbQbdMl4XIevPPJdYB0vqW7JJtL6HHh9CxkTPI/edit?gid=0#gid=0';

// Replace with your users Google Sheet URL or Spreadsheet ID (contains: email, password, sheet_url)
// Format: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
// Or just the spreadsheet ID: {SPREADSHEET_ID}
const USERS_SHEET_ID = import.meta.env.VITE_USERS_SHEET_ID || '';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('healthcare_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: UserCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if API key and users sheet are configured
      if (!GOOGLE_SHEETS_API_KEY || !USERS_SHEET_ID) {
        // Demo mode - simulate login
        const demoUser: User = {
          email: credentials.email,
          appointmentsSheetUrl: 'demo-sheet-url',
        };
        setUser(demoUser);
        localStorage.setItem('healthcare_user', JSON.stringify(demoUser));
        setIsLoading(false);
        return true;
      }

      const spreadsheetId = extractSpreadsheetId(USERS_SHEET_ID);
      if (!spreadsheetId) {
        throw new Error('Invalid users sheet ID format');
      }

      // Fetch users data from Google Sheets API v4
      // Assuming the sheet has columns: Email, Password, Appointments Sheet URL
      // Range: Sheet1!A2:C (starting from row 2 to skip header)
      const range = 'Sheet1!A2:C';
      const apiUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];
      
      // Find user by email and password
      const userRow = rows.find((row: string[]) => 
        row[0] === credentials.email && row[1] === credentials.password
      );

      if (userRow) {
        const loggedInUser: User = {
          email: userRow[0],
          appointmentsSheetUrl: userRow[2] || '', // Column C contains spreadsheetId
        };
        setUser(loggedInUser);
        localStorage.setItem('healthcare_user', JSON.stringify(loggedInUser));
        setIsLoading(false);
        return true;
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to login. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (credentials: UserCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if API key and users sheet are configured
      if (!GOOGLE_SHEETS_API_KEY || !USERS_SHEET_ID) {
        // Demo mode - simulate registration
        const demoUser: User = {
          email: credentials.email,
          appointmentsSheetUrl: 'demo-sheet-url-' + Date.now(),
        };
        setUser(demoUser);
        localStorage.setItem('healthcare_user', JSON.stringify(demoUser));
        setIsLoading(false);
        return true;
      }

      const spreadsheetId = extractSpreadsheetId(USERS_SHEET_ID);
      if (!spreadsheetId) {
        throw new Error('Invalid users sheet ID format');
      }

      // Check if user already exists
      const range = 'Sheet1!A2:C';
      const apiUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];
      
      // Check if email already exists
      const existingUser = rows.find((row: string[]) => row[0] === credentials.email);
      if (existingUser) {
        setError('Email already registered. Please login instead.');
        setIsLoading(false);
        return false;
      }

      // Generate a new appointments sheet URL (in production, this would create an actual sheet)
      // For now, we'll use a placeholder that the user needs to configure
      const newAppointmentsSheetUrl = `new-sheet-${Date.now()}`;

      // Append new user to the sheet
      // Find the next available row (after header + existing rows)
      const nextRow = rows.length + 2; // +2 for header row and 1-based indexing
      const appendRange = `Sheet1!A${nextRow}:C${nextRow}`;
      const appendUrl = `${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/${appendRange}?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`;
      
      const appendResponse = await fetch(appendUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[credentials.email, credentials.password, newAppointmentsSheetUrl]],
        }),
      });

      if (!appendResponse.ok) {
        const errorData = await appendResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${appendResponse.status}`);
      }

      // Login the newly registered user
      const newUser: User = {
        email: credentials.email,
        appointmentsSheetUrl: newAppointmentsSheetUrl,
      };
      setUser(newUser);
      localStorage.setItem('healthcare_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to register. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('healthcare_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
