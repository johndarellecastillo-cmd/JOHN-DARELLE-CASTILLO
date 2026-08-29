export type ScanMode = 'TIME_IN' | 'TIME_OUT';

export type TabType = 'scanner' | 'events' | 'roster';

export interface Student {
  id: string;
  studentId: string; // e.g. "2024-00123"
  fullName: string;
  program: string; // e.g. "BS Computer Science"
  yearLevel?: string; // e.g. "3rd Year"
  email?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  studentId: string;
  fullName: string;
  program: string;
  type: ScanMode;
  timestamp: string; // ISO string
  formattedTime?: string; // e.g. "09:45:12 AM"
  formattedDate?: string; // e.g. "Oct 24, 2024"
  source: 'qr_scanner' | 'manual_entry';
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  date: string; // e.g. "2025-03-15"
  venue?: string;
  createdAt: string;
}

export interface VerificationResult {
  student: Student;
  type: ScanMode;
  timestamp: string;
  recordId: string;
  isDuplicate?: boolean;
  statusMessage?: string;
}
