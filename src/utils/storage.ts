import { AttendanceRecord, EventItem, Student } from '../types';

const STORAGE_KEYS = {
  ROSTER: 'att_roster_v1',
  EVENTS: 'att_events_v1',
  ACTIVE_EVENT_ID: 'att_active_event_id_v1',
  LOGS_PREFIX: 'att_logs_',
  THEME: 'att_theme_v1',
  AUDIO: 'att_audio_enabled_v1',
};

// Seed realistic initial roster data
const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'std-1',
    studentId: '2024-10021',
    fullName: 'Sophia Elena Reyes',
    program: 'BS Computer Science',
    yearLevel: '3rd Year',
    email: 'sreyes@university.edu',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-2',
    studentId: '2024-10045',
    fullName: 'Liam Alexander Tan',
    program: 'BS Information Technology',
    yearLevel: '2nd Year',
    email: 'ltan@university.edu',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-3',
    studentId: '2024-10088',
    fullName: 'Isabella Marie Santos',
    program: 'BS Civil Engineering',
    yearLevel: '4th Year',
    email: 'isantos@university.edu',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-4',
    studentId: '2024-10112',
    fullName: 'Marcus Gabriel Cruz',
    program: 'BS Electronics Engineering',
    yearLevel: '3rd Year',
    email: 'mcruz@university.edu',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-5',
    studentId: '2024-10156',
    fullName: 'Chloe Denise Garcia',
    program: 'BS Nursing',
    yearLevel: '1st Year',
    email: 'cgarcia@university.edu',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-6',
    studentId: '2024-10204',
    fullName: 'Noah Benedict Flores',
    program: 'BS Business Administration',
    yearLevel: '2nd Year',
    email: 'nflores@university.edu',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-7',
    studentId: '2024-10289',
    fullName: 'Hannah Patricia Ramos',
    program: 'BS Accountancy',
    yearLevel: '4th Year',
    email: 'hramos@university.edu',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-8',
    studentId: '2024-10334',
    fullName: 'Ethan Joshua Navarro',
    program: 'BS Architecture',
    yearLevel: '3rd Year',
    email: 'enavarro@university.edu',
    createdAt: new Date().toISOString(),
  },
];

// Default initial events
const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 'evt-tech-summit-2025',
    title: 'University Tech Symposium & Career Fair',
    description: 'Annual gathering of tech students and industry leaders',
    date: new Date().toISOString().split('T')[0],
    venue: 'Grand University Auditorium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'evt-leadership-conf-2024',
    title: 'Student Leaders National Assembly',
    description: 'Interactive leadership training and student council workshops',
    date: '2024-11-18',
    venue: 'Executive Hall B',
    createdAt: new Date('2024-11-10').toISOString(),
  },
  {
    id: 'evt-orientation-2024',
    title: 'Freshmen University Welcome & Induction',
    description: 'Orientation for incoming freshmen batch 2024-2025',
    date: '2024-09-02',
    venue: 'University Gymnasium',
    createdAt: new Date('2024-08-25').toISOString(),
  },
];

// Pre-seed sample logs for past events
const SEED_PAST_LOGS_LEADERSHIP: AttendanceRecord[] = [
  {
    id: 'rec-1',
    eventId: 'evt-leadership-conf-2024',
    studentId: '2024-10021',
    fullName: 'Sophia Elena Reyes',
    program: 'BS Computer Science',
    type: 'TIME_IN',
    timestamp: '2024-11-18T08:15:22.000Z',
    formattedTime: '08:15:22 AM',
    formattedDate: 'Nov 18, 2024',
    source: 'qr_scanner',
  },
  {
    id: 'rec-2',
    eventId: 'evt-leadership-conf-2024',
    studentId: '2024-10021',
    fullName: 'Sophia Elena Reyes',
    program: 'BS Computer Science',
    type: 'TIME_OUT',
    timestamp: '2024-11-18T16:30:10.000Z',
    formattedTime: '04:30:10 PM',
    formattedDate: 'Nov 18, 2024',
    source: 'qr_scanner',
  },
  {
    id: 'rec-3',
    eventId: 'evt-leadership-conf-2024',
    studentId: '2024-10088',
    fullName: 'Isabella Marie Santos',
    program: 'BS Civil Engineering',
    type: 'TIME_IN',
    timestamp: '2024-11-18T08:24:15.000Z',
    formattedTime: '08:24:15 AM',
    formattedDate: 'Nov 18, 2024',
    source: 'qr_scanner',
  },
  {
    id: 'rec-4',
    eventId: 'evt-leadership-conf-2024',
    studentId: '2024-10112',
    fullName: 'Marcus Gabriel Cruz',
    program: 'BS Electronics Engineering',
    type: 'TIME_IN',
    timestamp: '2024-11-18T08:40:02.000Z',
    formattedTime: '08:40:02 AM',
    formattedDate: 'Nov 18, 2024',
    source: 'manual_entry',
  },
  {
    id: 'rec-5',
    eventId: 'evt-leadership-conf-2024',
    studentId: '2024-10112',
    fullName: 'Marcus Gabriel Cruz',
    program: 'BS Electronics Engineering',
    type: 'TIME_OUT',
    timestamp: '2024-11-18T17:05:44.000Z',
    formattedTime: '05:05:44 PM',
    formattedDate: 'Nov 18, 2024',
    source: 'qr_scanner',
  },
];

export const Storage = {
  // Roster
  getRoster(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROSTER);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(DEFAULT_STUDENTS));
        return DEFAULT_STUDENTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_STUDENTS;
    }
  },

  saveRoster(roster: Student[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(roster));
    } catch (e) {
      console.error('Failed to save roster', e);
    }
  },

  findStudentById(studentId: string): Student | undefined {
    const roster = this.getRoster();
    const cleanQuery = studentId.trim().toLowerCase();
    return roster.find(
      (s) => s.studentId.trim().toLowerCase() === cleanQuery || s.id.toLowerCase() === cleanQuery
    );
  },

  addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const roster = this.getRoster();
    const newStudent: Student = {
      ...student,
      id: 'std-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    const updated = [newStudent, ...roster];
    this.saveRoster(updated);
    return newStudent;
  },

  updateStudent(student: Student) {
    const roster = this.getRoster();
    const index = roster.findIndex((s) => s.id === student.id);
    if (index !== -1) {
      roster[index] = student;
      this.saveRoster([...roster]);
    }
  },

  deleteStudent(id: string) {
    const roster = this.getRoster();
    const updated = roster.filter((s) => s.id !== id);
    this.saveRoster(updated);
  },

  // Events
  getEvents(): EventItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
        // Also seed leadership logs
        localStorage.setItem(
          `${STORAGE_KEYS.LOGS_PREFIX}evt-leadership-conf-2024`,
          JSON.stringify(SEED_PAST_LOGS_LEADERSHIP)
        );
        return DEFAULT_EVENTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_EVENTS;
    }
  },

  saveEvents(events: EventItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events', e);
    }
  },

  getActiveEventId(): string {
    try {
      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
      const events = this.getEvents();
      if (activeId && events.some((e) => e.id === activeId)) {
        return activeId;
      }
      if (events.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, events[0].id);
        return events[0].id;
      }
      return '';
    } catch {
      return '';
    }
  },

  setActiveEventId(eventId: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, eventId);
    } catch (e) {
      console.error('Failed to set active event', e);
    }
  },

  createEvent(eventData: Omit<EventItem, 'id' | 'createdAt'>): EventItem {
    const events = this.getEvents();
    const newEvent: EventItem = {
      ...eventData,
      id: 'evt-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newEvent, ...events];
    this.saveEvents(updated);
    this.setActiveEventId(newEvent.id);
    return newEvent;
  },

  deleteEvent(eventId: string) {
    const events = this.getEvents();
    const updated = events.filter((e) => e.id !== eventId);
    this.saveEvents(updated);
    try {
      localStorage.removeItem(`${STORAGE_KEYS.LOGS_PREFIX}${eventId}`);
    } catch {
      // Ignore
    }
    if (this.getActiveEventId() === eventId) {
      if (updated.length > 0) {
        this.setActiveEventId(updated[0].id);
      }
    }
  },

  // Attendance Logs per Event
  getLogs(eventId: string): AttendanceRecord[] {
    if (!eventId) return [];
    try {
      const key = `${STORAGE_KEYS.LOGS_PREFIX}${eventId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLogs(eventId: string, logs: AttendanceRecord[]) {
    if (!eventId) return;
    try {
      const key = `${STORAGE_KEYS.LOGS_PREFIX}${eventId}`;
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save logs', e);
    }
  },

  addLog(record: Omit<AttendanceRecord, 'id' | 'timestamp' | 'formattedTime' | 'formattedDate'>): AttendanceRecord {
    const currentLogs = this.getLogs(record.eventId);
    const dateObj = new Date();
    
    const formattedTime = dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newRecord: AttendanceRecord = {
      ...record,
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: dateObj.toISOString(),
      formattedTime,
      formattedDate,
    };

    // Prepend to show most recent first
    const updated = [newRecord, ...currentLogs];
    this.saveLogs(record.eventId, updated);
    return newRecord;
  },

  deleteLog(eventId: string, recordId: string) {
    const currentLogs = this.getLogs(eventId);
    const updated = currentLogs.filter((r) => r.id !== recordId);
    this.saveLogs(eventId, updated);
    return updated;
  },

  // Theme & Audio settings
  getTheme(): 'light' | 'dark' {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.THEME);
      if (val === 'light' || val === 'dark') return val;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  setTheme(theme: 'light' | 'dark') {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // Ignore
    }
  },

  getAudioEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.AUDIO);
      return val !== 'false';
    } catch {
      return true;
    }
  },

  setAudioEnabled(enabled: boolean) {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIO, enabled ? 'true' : 'false');
    } catch {
      // Ignore
    }
  },

  // Reset demo data helper
  resetAllDemoData() {
    try {
      localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(DEFAULT_STUDENTS));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, DEFAULT_EVENTS[0].id);
      localStorage.setItem(
        `${STORAGE_KEYS.LOGS_PREFIX}evt-leadership-conf-2024`,
        JSON.stringify(SEED_PAST_LOGS_LEADERSHIP)
      );
      localStorage.removeItem(`${STORAGE_KEYS.LOGS_PREFIX}${DEFAULT_EVENTS[0].id}`);
    } catch {
      // Ignore
    }
  },
};
