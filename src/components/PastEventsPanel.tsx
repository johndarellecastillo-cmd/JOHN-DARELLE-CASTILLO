import React, { useState } from 'react';
import {
  CalendarDays,
  Users,
  Download,
  Eye,
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  X,
  MapPin,
  FileSpreadsheet,
  Percent,
  UserCheck,
  Activity,
  UserX
} from 'lucide-react';
import { AttendanceRecord, EventItem } from '../types';
import { Storage } from '../utils/storage';
import { exportAttendanceToCSV } from '../utils/csv';
import { soundFx } from '../utils/audio';

interface PastEventsPanelProps {
  events: EventItem[];
  activeEvent: EventItem | null;
  onSelectActiveEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
  onDeleteEvent: (eventId: string) => void;
  onLogsUpdated: () => void;
}

export const PastEventsPanel: React.FC<PastEventsPanelProps> = ({
  events,
  activeEvent,
  onSelectActiveEvent,
  onOpenNewEventModal,
  onDeleteEvent,
  onLogsUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);
  
  // Modal table filters
  const [modalSearch, setModalSearch] = useState('');
  const [modalTypeFilter, setModalTypeFilter] = useState<'ALL' | 'TIME_IN' | 'TIME_OUT'>('ALL');

  // Filter events list
  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue && e.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.date.includes(searchQuery)
  );

  // Compute metrics for an event
  const getEventStats = (eventId: string) => {
    const logs = Storage.getLogs(eventId);
    const uniqueStudents = new Set(logs.map((l) => l.studentId)).size;
    const timeInCount = logs.filter((l) => l.type === 'TIME_IN').length;
    const timeOutCount = logs.filter((l) => l.type === 'TIME_OUT').length;

    return {
      totalLogs: logs.length,
      uniqueStudents,
      timeInCount,
      timeOutCount,
      logs,
    };
  };

  // Modal Logs filtered & metrics
  const modalEventLogs = selectedEventForModal ? Storage.getLogs(selectedEventForModal.id) : [];
  const modalUniqueAttendees = new Set(modalEventLogs.map((l) => l.studentId)).size;
  const totalRosterCount = Storage.getRoster().length;
  const attendanceRate = totalRosterCount > 0 ? (modalUniqueAttendees / totalRosterCount) * 100 : 0;
  const formattedRate = totalRosterCount > 0
    ? `${attendanceRate % 1 === 0 ? attendanceRate.toFixed(0) : attendanceRate.toFixed(1)}%`
    : '0%';
  const modalTimeInCount = modalEventLogs.filter((l) => l.type === 'TIME_IN').length;
  const modalTimeOutCount = modalEventLogs.filter((l) => l.type === 'TIME_OUT').length;
  const absentCount = Math.max(0, totalRosterCount - modalUniqueAttendees);

  const activeModalLogs = selectedEventForModal
    ? modalEventLogs.filter((log) => {
        const matchesSearch =
          log.fullName.toLowerCase().includes(modalSearch.toLowerCase()) ||
          log.studentId.toLowerCase().includes(modalSearch.toLowerCase()) ||
          log.program.toLowerCase().includes(modalSearch.toLowerCase());
        const matchesType = modalTypeFilter === 'ALL' || log.type === modalTypeFilter;
        return matchesSearch && matchesType;
      })
    : [];

  const handleExportCSV = (eventItem: EventItem) => {
    soundFx.playClick();
    const logs = Storage.getLogs(eventItem.id);
    exportAttendanceToCSV(logs, eventItem.title);
  };

  const handleDeleteRecord = (eventId: string, recordId: string) => {
    if (window.confirm('Delete this attendance record?')) {
      Storage.deleteLog(eventId, recordId);
      onLogsUpdated();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Past Events & Records
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Archived attendance rosters, exportable logs, and historical analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event title..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          <button
            id="create-event-btn"
            onClick={() => {
              soundFx.playClick();
              onOpenNewEventModal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 backdrop-blur-sm shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-white/40 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl space-y-3 shadow-xs">
          <CalendarDays className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            No events found matching your search.
          </p>
          <button
            onClick={onOpenNewEventModal}
            className="px-4 py-2 rounded-xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/40 dark:border-white/10 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-white/80"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => {
            const stats = getEventStats(evt.id);
            const isActive = activeEvent?.id === evt.id;

            return (
              <div
                key={evt.id}
                className={`group rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-md shadow-black/5 hover:bg-white/80 dark:hover:bg-zinc-900/80 hover:shadow-lg ${
                  isActive
                    ? 'border-emerald-500/60 dark:border-emerald-500/50 ring-2 ring-emerald-500/15'
                    : 'border-white/40 dark:border-white/10 hover:border-white/60 dark:hover:border-white/20'
                }`}
              >
                <div>
                  {/* Card Header & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{evt.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 uppercase tracking-wider backdrop-blur-md">
                          Active
                        </span>
                      )}

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          if (events.length <= 1) {
                            alert('Cannot delete the last event.');
                            return;
                          }
                          if (window.confirm(`Delete event "${evt.title}" and all its logs?`)) {
                            onDeleteEvent(evt.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight line-clamp-1 mb-1">
                    {evt.title}
                  </h3>

                  {evt.venue && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </p>
                  )}

                  {evt.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
                      {evt.description}
                    </p>
                  )}

                  {/* Attendance Stats Summary */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/5 mb-4">
                    <div className="text-center">
                      <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {stats.uniqueStudents}
                      </span>
                      <span className="text-[10px] text-zinc-400">Attendees</span>
                    </div>

                    <div className="text-center border-x border-zinc-200/40 dark:border-zinc-700/40">
                      <span className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {stats.timeInCount}
                      </span>
                      <span className="text-[10px] text-zinc-400">Time In</span>
                    </div>

                    <div className="text-center">
                      <span className="block text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {stats.timeOutCount}
                      </span>
                      <span className="text-[10px] text-zinc-400">Time Out</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-1 border-t border-zinc-200/40 dark:border-white/5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setModalSearch('');
                        setModalTypeFilter('ALL');
                        setSelectedEventForModal(evt);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/60 dark:bg-zinc-800/60 hover:bg-white/90 dark:hover:bg-zinc-700/80 border border-white/40 dark:border-white/10 text-zinc-800 dark:text-zinc-200 transition-colors backdrop-blur-md shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Table</span>
                    </button>

                    <button
                      onClick={() => handleExportCSV(evt)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/60 dark:bg-zinc-800/60 hover:bg-white/90 dark:hover:bg-zinc-700/80 border border-white/40 dark:border-white/10 text-zinc-800 dark:text-zinc-200 transition-colors backdrop-blur-md shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onSelectActiveEvent(evt.id);
                      }}
                      className="w-full text-center text-[11px] font-medium text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition-colors"
                    >
                      Set as active scanner event
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over / Modal for full attendance log table */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-200/50 dark:border-white/10 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/60 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border border-white/40 dark:border-white/10 backdrop-blur-md">
                    {selectedEventForModal.date}
                  </span>
                  {selectedEventForModal.venue && (
                    <span className="text-xs text-zinc-500">
                      • {selectedEventForModal.venue}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedEventForModal.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV(selectedEventForModal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/25 backdrop-blur-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>

                <button
                  onClick={() => setSelectedEventForModal(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Summary Stats Card: Turnout % vs Total Roster */}
            <div className="p-4 sm:p-5 border-b border-zinc-200/50 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Attendance Rate Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-500" />
                      Attendance Rate
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {formattedRate} Turnout
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {formattedRate}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      of enrolled roster
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-zinc-200/70 dark:bg-zinc-700/60 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
                    />
                  </div>
                </div>

                {/* Headcount vs Roster Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                      Student Turnout
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                      Roster: {totalRosterCount}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {modalUniqueAttendees}
                    </span>
                    <span className="text-sm font-semibold text-zinc-400">
                      / {totalRosterCount}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                      Students Present
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 pt-2 border-t border-zinc-200/40 dark:border-white/5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      {modalUniqueAttendees} Attended
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
                      {absentCount} Unmarked
                    </span>
                  </div>
                </div>

                {/* Activity & Scan Log Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      Activity Breakdown
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                      {modalEventLogs.length} Records
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {modalEventLogs.length}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Total Logs
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 pt-2 border-t border-zinc-200/40 dark:border-white/5">
                    <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {modalTimeInCount} In
                    </span>
                    <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="w-3 h-3" />
                      {modalTimeOutCount} Out
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Filter Toolbar */}
            <div className="px-5 py-3 border-b border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      id="detailed-log-search-input"
                      type="text"
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      placeholder="Search student by name or ID (e.g. Santos, 2024-1002)..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-medium"
                    />
                    {modalSearch && (
                      <button
                        onClick={() => setModalSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        title="Clear student search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center bg-white/40 dark:bg-zinc-800/60 backdrop-blur-md p-1 rounded-xl border border-white/30 dark:border-white/5 text-xs font-medium">
                  <button
                    onClick={() => setModalTypeFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      modalTypeFilter === 'ALL'
                        ? 'bg-white/90 dark:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 shadow-xs backdrop-blur-sm'
                        : 'text-zinc-500'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setModalTypeFilter('TIME_IN')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      modalTypeFilter === 'TIME_IN'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Time In
                  </button>
                  <button
                    onClick={() => setModalTypeFilter('TIME_OUT')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      modalTypeFilter === 'TIME_OUT'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Time Out
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeModalLogs.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 space-y-2">
                  <p className="text-xs font-medium">
                    {modalSearch || modalTypeFilter !== 'ALL'
                      ? `No attendance records matching your filter${modalSearch ? ` "${modalSearch}"` : ''}.`
                      : 'No attendance records logged for this event yet.'}
                  </p>
                  {(modalSearch || modalTypeFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setModalSearch('');
                        setModalTypeFilter('ALL');
                      }}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/60 dark:bg-zinc-800/60 border border-white/40 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-white/90 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200/60 dark:border-white/10 text-zinc-400 uppercase tracking-wider font-semibold">
                        <th className="pb-3 font-semibold">Student</th>
                        <th className="pb-3 font-semibold">Program</th>
                        <th className="pb-3 font-semibold">Action</th>
                        <th className="pb-3 font-semibold">Timestamp</th>
                        <th className="pb-3 font-semibold">Source</th>
                        <th className="pb-3 font-semibold text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/40 dark:divide-white/5">
                      {activeModalLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-3 font-medium text-zinc-900 dark:text-zinc-100">
                            <div>{log.fullName}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">
                              {log.studentId}
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-zinc-600 dark:text-zinc-400">
                            {log.program}
                          </td>
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md ${
                                log.type === 'TIME_IN'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                              }`}
                            >
                              {log.type === 'TIME_IN' ? 'TIME IN' : 'TIME OUT'}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-zinc-600 dark:text-zinc-400 font-mono">
                            {log.formattedTime || log.timestamp}
                          </td>
                          <td className="py-3 pr-3 text-zinc-500 capitalize">
                            {log.source === 'qr_scanner' ? 'QR Code' : 'Manual'}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() =>
                                handleDeleteRecord(selectedEventForModal.id, log.id)
                              }
                              className="text-zinc-400 hover:text-rose-500 p-1 transition-colors"
                              title="Delete Record"
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

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200/50 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md flex items-center justify-between text-xs text-zinc-500">
              <span>
                {modalSearch || modalTypeFilter !== 'ALL'
                  ? `Showing ${activeModalLogs.length} of ${Storage.getLogs(selectedEventForModal.id).length} records`
                  : `Total ${activeModalLogs.length} attendance records`}
              </span>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="px-4 py-1.5 rounded-xl bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 font-medium backdrop-blur-sm hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
