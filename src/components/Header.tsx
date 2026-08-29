import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  CalendarDays,
  Users,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ChevronDown,
  Plus,
  Radio,
  Check,
  Smartphone
} from 'lucide-react';
import { EventItem, TabType } from '../types';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  events: EventItem[];
  activeEvent: EventItem | null;
  onSelectEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  todayLogCount: number;
  onOpenAndroidModal?: () => void;
  isPwaInstallable?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  events,
  activeEvent,
  onSelectEvent,
  onOpenNewEventModal,
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  todayLogCount,
  onOpenAndroidModal,
  isPwaInstallable,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/40 dark:border-white/10 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand + Discreet Event Switcher */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-950 flex items-center justify-center shadow-sm backdrop-blur-sm">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-zinc-100 hidden sm:inline-block">
              Attendance
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-300/60 dark:bg-zinc-800 shrink-0 hidden sm:block" />

          {/* Event Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="event-switcher-btn"
              onClick={() => {
                soundFx.playClick();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 bg-white/50 dark:bg-zinc-900/50 hover:bg-white/80 dark:hover:bg-zinc-800/80 border border-white/40 dark:border-white/10 backdrop-blur-md transition-all shadow-xs max-w-[200px] sm:max-w-[280px]"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse ring-2 ring-emerald-500/20" />
              <span className="truncate text-left font-medium">
                {activeEvent ? activeEvent.title : 'Select Event'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-auto" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl shadow-zinc-950/15 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 border-b border-zinc-200/50 dark:border-white/5 flex items-center justify-between">
                  <span>Current Events</span>
                  <span>{events.length}</span>
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {events.map((evt) => {
                    const isSelected = activeEvent?.id === evt.id;
                    return (
                      <button
                        key={evt.id}
                        onClick={() => {
                          onSelectEvent(evt.id);
                          setIsDropdownOpen(false);
                          soundFx.playClick();
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between gap-2 transition-colors ${
                          isSelected
                            ? 'text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/10 dark:bg-emerald-500/15'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate font-medium">{evt.title}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {evt.date} {evt.venue ? `• ${evt.venue}` : ''}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-zinc-200/50 dark:border-white/5 pt-1 mt-1 px-1.5">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenNewEventModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-white/60 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Create New Event...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Bar (Pill Tabs) */}
        <nav className="flex items-center bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-1 rounded-2xl border border-white/40 dark:border-white/10 shadow-inner shrink-0">
          <button
            id="tab-scanner-btn"
            onClick={() => {
              onTabChange('scanner');
              soundFx.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'scanner'
                ? 'bg-white/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-sm border border-white/60 dark:border-white/10 backdrop-blur-md'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${currentTab === 'scanner' ? 'text-emerald-500' : ''}`} />
            <span className="hidden md:inline">Scanner Panel</span>
            <span className="md:hidden">Scan</span>
            {todayLogCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold ml-0.5 border border-emerald-500/20">
                {todayLogCount}
              </span>
            )}
          </button>

          <button
            id="tab-events-btn"
            onClick={() => {
              onTabChange('events');
              soundFx.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'events'
                ? 'bg-white/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-sm border border-white/60 dark:border-white/10 backdrop-blur-md'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Past Events / Records</span>
            <span className="md:hidden">Records</span>
          </button>

          <button
            id="tab-roster-btn"
            onClick={() => {
              onTabChange('roster');
              soundFx.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'roster'
                ? 'bg-white/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 shadow-sm border border-white/60 dark:border-white/10 backdrop-blur-md'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Student Roster</span>
            <span className="md:hidden">Roster</span>
          </button>
        </nav>

        {/* Right: Android App, Audio toggle & Theme switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenAndroidModal && (
            <button
              id="android-app-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenAndroidModal();
              }}
              title="Android App Info & APK Setup"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 backdrop-blur-md transition-all shadow-2xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Android App</span>
              {isPwaInstallable && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-0.5" />
              )}
            </button>
          )}

          <button
            id="toggle-audio-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Sound On' : 'Muted'}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 bg-white/40 dark:bg-zinc-900/40 hover:bg-white/70 dark:hover:bg-zinc-800 border border-white/40 dark:border-white/10 backdrop-blur-md transition-all shadow-2xs"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
          </button>

          <button
            id="toggle-theme-btn"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 bg-white/40 dark:bg-zinc-900/40 hover:bg-white/70 dark:hover:bg-zinc-800 border border-white/40 dark:border-white/10 backdrop-blur-md transition-all shadow-2xs"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
