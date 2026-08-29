import { AttendanceRecord, Student } from '../types';

export function exportAttendanceToCSV(records: AttendanceRecord[], eventTitle: string) {
  if (!records || records.length === 0) {
    alert('No attendance records available to export.');
    return;
  }

  const headers = [
    'Student ID',
    'Full Name',
    'Academic Program',
    'Action Type',
    'Timestamp',
    'Time',
    'Date',
    'Source',
  ];

  const rows = records.map((r) => [
    `"${r.studentId.replace(/"/g, '""')}"`,
    `"${r.fullName.replace(/"/g, '""')}"`,
    `"${r.program.replace(/"/g, '""')}"`,
    `"${r.type}"`,
    `"${r.timestamp}"`,
    `"${r.formattedTime || ''}"`,
    `"${r.formattedDate || ''}"`,
    `"${r.source}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  link.setAttribute('href', url);
  link.setAttribute('download', `attendance_${sanitizedTitle}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRosterToCSV(roster: Student[]) {
  if (!roster || roster.length === 0) {
    alert('No student roster records to export.');
    return;
  }

  const headers = ['ID Number', 'Full Name', 'Academic Program', 'Year Level', 'Email'];
  const rows = roster.map((s) => [
    `"${s.studentId.replace(/"/g, '""')}"`,
    `"${s.fullName.replace(/"/g, '""')}"`,
    `"${s.program.replace(/"/g, '""')}"`,
    `"${s.yearLevel || ''}"`,
    `"${s.email || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `student_roster_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSampleRosterTemplate() {
  const sampleData = [
    'ID Number,Full Name,Academic Program,Year Level,Email',
    '2024-00101,John Christian David,BS Computer Science,3rd Year,jdavid@university.edu',
    '2024-00102,Maria Carmela Ramos,BS Information Systems,2nd Year,mramos@university.edu',
    '2024-00103,Rafael Angelo Santos,BS Accountancy,4th Year,rsantos@university.edu',
    '2024-00104,Alyssa Nicole Tan,BS Nursing,1st Year,atan@university.edu',
    '2024-00105,Gabriel Luis Mendoza,BS Civil Engineering,3rd Year,gmendoza@university.edu',
  ].join('\n');

  const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'roster_template_sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVFile(csvText: string): { students: Omit<Student, 'id' | 'createdAt'>[]; errors: string[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const errors: string[] = [];
  const students: Omit<Student, 'id' | 'createdAt'>[] = [];

  if (lines.length === 0) {
    return { students: [], errors: ['CSV file is empty.'] };
  }

  // Parse header
  const headerLine = lines[0];
  const headerCols = parseCSVLine(headerLine).map((c) => c.trim().toLowerCase());

  let idIdx = headerCols.findIndex((c) => c.includes('id') || c.includes('student'));
  let nameIdx = headerCols.findIndex((c) => c.includes('name'));
  let programIdx = headerCols.findIndex((c) => c.includes('program') || c.includes('course') || c.includes('dept') || c.includes('major'));
  let yearIdx = headerCols.findIndex((c) => c.includes('year') || c.includes('level'));
  let emailIdx = headerCols.findIndex((c) => c.includes('email') || c.includes('mail'));

  // Default fallbacks if header does not match names
  if (idIdx === -1) idIdx = 0;
  if (nameIdx === -1) nameIdx = 1;
  if (programIdx === -1) programIdx = 2;

  // Process rows
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;
    const cols = parseCSVLine(rawLine);

    const studentId = cols[idIdx]?.trim() || '';
    const fullName = cols[nameIdx]?.trim() || '';
    const program = cols[programIdx]?.trim() || 'General Program';
    const yearLevel = yearIdx !== -1 ? cols[yearIdx]?.trim() : '';
    const email = emailIdx !== -1 ? cols[emailIdx]?.trim() : '';

    if (!studentId || !fullName) {
      errors.push(`Row ${i + 1}: Missing student ID or Full Name.`);
      continue;
    }

    students.push({
      studentId,
      fullName,
      program,
      yearLevel: yearLevel || undefined,
      email: email || undefined,
    });
  }

  return { students, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
