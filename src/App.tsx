import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScannerPanel } from './components/ScannerPanel';
import { PastEventsPanel } from './components/PastEventsPanel';
import { RosterPanel } from './components/RosterPanel';
import { EventModal } from './components/EventModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AttendanceRecord, EventItem, Student, TabType } from './types';
import { Storage } from './utils/storage';
import { soundFx } from './utils/audio';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as TabType;
      if (tabParam && ['scanner', 'events', 'roster'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'scanner';
  });

  // Theme & Audio Preferences
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return Storage.getTheme() === 'dark';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return Storage.getAudioEnabled();
  });

  // State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>('');
  const [roster, setRoster] = useState<Student[]>([]);
  const [activeEventLogs, setActiveEventLogs] = useState<AttendanceRecord[]>([]);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // PWA / Android Install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  // Initialize data on mount & catch PWA install prompt
  useEffect(() => {
    const loadedEvents = Storage.getEvents();
    const loadedActiveId = Storage.getActiveEventId();
    const loadedRoster = Storage.getRoster();

    setEvents(loadedEvents);
    setActiveEventId(loadedActiveId);
    setRoster(loadedRoster);

    if (loadedActiveId) {
      setActiveEventLogs(Storage.getLogs(loadedActiveId));
    }

    // Check if running in standalone Android/PWA mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsAndroidModalOpen(false);
    }
  };

  // Theme management sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    Storage.setTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Audio preference sync
  useEffect(() => {
    soundFx.setSoundEnabled(soundEnabled);
    Storage.setAudioEnabled(soundEnabled);
  }, [soundEnabled]);

  // Handle active event logs sync when active event changes
  useEffect(() => {
    if (activeEventId) {
      setActiveEventLogs(Storage.getLogs(activeEventId));
    } else {
      setActiveEventLogs([]);
    }
  }, [activeEventId]);

  const activeEvent = events.find((e) => e.id === activeEventId) || null;

  // Handlers
  const handleSelectEvent = (eventId: string) => {
    setActiveEventId(eventId);
    Storage.setActiveEventId(eventId);
    setActiveEventLogs(Storage.getLogs(eventId));
  };

  const handleEventCreated = (newEvent: EventItem) => {
    const updatedEvents = Storage.getEvents();
    setEvents(updatedEvents);
    setActiveEventId(newEvent.id);
    setActiveEventLogs([]);
  };

  const handleDeleteEvent = (eventId: string) => {
    Storage.deleteEvent(eventId);
    const updatedEvents = Storage.getEvents();
    setEvents(updatedEvents);
    const newActiveId = Storage.getActiveEventId();
    setActiveEventId(newActiveId);
  };

  const handleNewLogAdded = (record: AttendanceRecord) => {
    setActiveEventLogs((prev) => [record, ...prev]);
  };

  const handleLogsUpdated = () => {
    if (activeEventId) {
      setActiveEventLogs(Storage.getLogs(activeEventId));
    }
  };

  const handleToggleDarkMode = () => {
    soundFx.playClick();
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleSound = () => {
    soundFx.playClick();
    setSoundEnabled((prev) => !prev);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'frosted-bg-dark' : 'frosted-bg-light'} text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300 relative selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300`}>
      {/* Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        todayLogCount={activeEventLogs.length}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        isPwaInstallable={!!deferredPrompt}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-24 md:pb-16">
        {currentTab === 'scanner' && (
          <ScannerPanel
            activeEvent={activeEvent}
            logs={activeEventLogs}
            onNewLogAdded={handleNewLogAdded}
            onSwitchToRoster={() => setCurrentTab('roster')}
          />
        )}

        {currentTab === 'events' && (
          <PastEventsPanel
            events={events}
            activeEvent={activeEvent}
            onSelectActiveEvent={handleSelectEvent}
            onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
            onDeleteEvent={handleDeleteEvent}
            onLogsUpdated={handleLogsUpdated}
          />
        )}

        {currentTab === 'roster' && (
          <RosterPanel
            roster={roster}
            onRosterUpdated={(newRoster) => setRoster(newRoster)}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        todayLogCount={activeEventLogs.length}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        isPwaInstallable={!!deferredPrompt}
      />

      {/* Create Event Modal */}
      <EventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Android Install & APK Setup Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
        isStandalone={isStandalone}
      />
    </div>
  );
}
