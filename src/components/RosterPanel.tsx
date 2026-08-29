import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  Trash2,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  X,
  FileText
} from 'lucide-react';
import { Student } from '../types';
import { Storage } from '../utils/storage';
import {
  downloadSampleRosterTemplate,
  exportRosterToCSV,
  parseCSVFile
} from '../utils/csv';
import { soundFx } from '../utils/audio';
import { StudentQRModal } from './StudentQRModal';

interface RosterPanelProps {
  roster: Student[];
  onRosterUpdated: (newRoster: Student[]) => void;
}

export const RosterPanel: React.FC<RosterPanelProps> = ({ roster, onRosterUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForQR, setSelectedStudentForQR] = useState<Student | null>(null);
  
  // Single Student Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newProgram, setNewProgram] = useState('');
  const [newYearLevel, setNewYearLevel] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // CSV Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    successCount?: number;
    errors?: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students
  const filteredRoster = roster.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle CSV file processing
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setImportStatus({ errors: ['Please upload a valid .csv file format.'] });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const { students, errors } = parseCSVFile(text);
      if (students.length === 0 && errors.length > 0) {
        setImportStatus({ errors });
        return;
      }

      // Merge into roster avoiding duplicate ID Numbers
      const existingRoster = Storage.getRoster();
      const existingMap = new Map(existingRoster.map((s) => [s.studentId.toLowerCase(), s]));

      let addedCount = 0;
      students.forEach((newStd) => {
        const key = newStd.studentId.trim().toLowerCase();
        if (!existingMap.has(key)) {
          const added = Storage.addStudent(newStd);
          existingMap.set(key, added);
          addedCount++;
        }
      });

      const updated = Array.from(existingMap.values());
      onRosterUpdated(updated);

      soundFx.playTimeIn();
      setImportStatus({
        successCount: addedCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // Add single student manual form submission
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId.trim() || !newFullName.trim()) {
      setAddError('Student ID and Full Name are required.');
      return;
    }

    // Check duplicate ID
    if (Storage.findStudentById(newStudentId)) {
      setAddError('A student with this ID Number already exists.');
      return;
    }

    const created = Storage.addStudent({
      studentId: newStudentId.trim(),
      fullName: newFullName.trim(),
      program: newProgram.trim() || 'General Program',
      yearLevel: newYearLevel.trim() || undefined,
    });

    onRosterUpdated(Storage.getRoster());
    soundFx.playTimeIn();
    
    // Reset form
    setNewStudentId('');
    setNewFullName('');
    setNewProgram('');
    setNewYearLevel('');
    setAddError(null);
    setShowAddModal(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    soundFx.playClick();
    if (window.confirm(`Remove ${name} from roster?`)) {
      Storage.deleteStudent(id);
      onRosterUpdated(Storage.getRoster());
    }
  };

  const handleResetDefaultRoster = () => {
    if (window.confirm('Reload pre-configured demo student roster?')) {
      Storage.resetAllDemoData();
      onRosterUpdated(Storage.getRoster());
      soundFx.playTimeIn();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Student Roster Management
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Import student CSV databases, generate QR ID badges, and manage registered profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRosterToCSV(roster)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/60 dark:bg-zinc-900/60 hover:bg-white/90 dark:hover:bg-zinc-800 border border-white/40 dark:border-white/10 text-zinc-800 dark:text-zinc-200 transition-colors backdrop-blur-md shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>

          <button
            id="add-student-btn"
            onClick={() => {
              soundFx.playClick();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity backdrop-blur-sm shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* CSV Upload Drop-Zone & Fast Action Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Minimalist Drag-and-drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-2 p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group backdrop-blur-xl shadow-lg shadow-black/5 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-white/40 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 hover:bg-white/80 dark:hover:bg-zinc-850/80 hover:border-emerald-500/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 border border-white/40 dark:border-white/10 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
            Drop your Student CSV file here, or{' '}
            <span className="text-emerald-600 dark:text-emerald-400 underline">browse</span>
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
            Expected columns: <code className="font-mono text-zinc-800 dark:text-zinc-200 bg-white/50 dark:bg-white/10 px-1 py-0.5 rounded-md">ID Number, Full Name, Program</code>
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                downloadSampleRosterTemplate();
              }}
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 bg-white/60 dark:bg-white/10 hover:bg-white/90 border border-white/40 dark:border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Download Sample CSV Template</span>
            </button>
          </div>
        </div>

        {/* Quick Stats & Preload Card */}
        <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg shadow-black/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Roster Overview
              </h4>
            </div>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {roster.length}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Enrolled / Registered Students</p>
          </div>

          <div className="pt-4 border-t border-zinc-200/40 dark:border-white/5 space-y-2">
            <button
              onClick={handleResetDefaultRoster}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-white/40 dark:border-white/10 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-white/90 dark:hover:bg-zinc-700/80 backdrop-blur-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Sample Demo Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import feedback banner */}
      {importStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 backdrop-blur-md ${
            importStatus.errors && importStatus.errors.length > 0
              ? 'bg-amber-500/15 border-amber-500/20 text-amber-800 dark:text-amber-300'
              : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {importStatus.errors && importStatus.errors.length > 0 ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <div>
              {typeof importStatus.successCount === 'number' && (
                <p className="font-semibold">
                  Successfully imported {importStatus.successCount} new students!
                </p>
              )}
              {importStatus.errors && (
                <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px]">
                  {importStatus.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Search Preview Table */}
      <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 shadow-xl shadow-black/5 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200/50 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Name, or Program..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Showing {filteredRoster.length} of {roster.length} students
          </div>
        </div>

        {/* Table Body */}
        {filteredRoster.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No students found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200/60 dark:border-white/10 text-zinc-400 uppercase tracking-wider font-semibold bg-white/30 dark:bg-white/5">
                  <th className="py-3 px-5 font-semibold">Student ID</th>
                  <th className="py-3 px-4 font-semibold">Full Name</th>
                  <th className="py-3 px-4 font-semibold">Program</th>
                  <th className="py-3 px-4 font-semibold">Year Level</th>
                  <th className="py-3 px-4 font-semibold text-center">QR Pass</th>
                  <th className="py-3 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-white/5">
                {filteredRoster.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {student.studentId}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      <div>{student.fullName}</div>
                      {student.email && (
                        <div className="text-[11px] text-zinc-400 font-normal">
                          {student.email}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 font-medium">
                      {student.program}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500">
                      {student.yearLevel || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedStudentForQR(student);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/60 dark:bg-zinc-800/60 hover:bg-white/90 dark:hover:bg-zinc-700 border border-white/40 dark:border-white/10 text-zinc-700 dark:text-zinc-200 text-xs font-semibold backdrop-blur-md shadow-2xs transition-colors"
                        title="View / Print QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View QR</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.fullName)}
                        className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Student Addition Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200/50 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Register New Student
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-5 space-y-4">
              {addError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs backdrop-blur-md">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Student ID Number *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="e.g. 2024-10499"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Gabriel Santos"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Academic Program
                </label>
                <input
                  type="text"
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Year Level (Optional)
                </label>
                <input
                  type="text"
                  value={newYearLevel}
                  onChange={(e) => setNewYearLevel(e.target.value)}
                  placeholder="e.g. 3rd Year"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 hover:opacity-90 backdrop-blur-sm"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Pass Viewer Modal */}
      <StudentQRModal
        student={selectedStudentForQR}
        onClose={() => setSelectedStudentForQR(null)}
      />
    </div>
  );
};
