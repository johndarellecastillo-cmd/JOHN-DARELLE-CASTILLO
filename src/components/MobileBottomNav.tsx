import React from 'react';
import { Radio, CalendarDays, Users, Smartphone, Plus } from 'lucide-react';
import { TabType } from '../types';
import { soundFx } from '../utils/audio';

interface MobileBottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  todayLogCount: number;
  onOpenAndroidModal: () => void;
  onOpenNewEventModal: () => void;
  isPwaInstallable: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  todayLogCount,
  onOpenAndroidModal,
  onOpenNewEventModal,
  isPwaInstallable,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/75 dark:bg-zinc-950/80 backdrop-blur-2xl border-t border-white/40 dark:border-white/10 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg shadow-black/10 transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Scanner Tab */}
        <button
          id="mobile-tab-scanner"
          onClick={() => {
            soundFx.playClick();
            onTabChange('scanner');
          }}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'scanner'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5" />
            {todayLogCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-white font-extrabold shadow-xs">
                {todayLogCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Scanner</span>
          {currentTab === 'scanner' && (
            <span className="w-1 h-1 rounded-full bg-emerald-500 absolute -bottom-0.5" />
          )}
        </button>

        {/* Records / Events Tab */}
        <button
          id="mobile-tab-events"
          onClick={() => {
            soundFx.playClick();
            onTabChange('events');
          }}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'events'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Records</span>
          {currentTab === 'events' && (
            <span className="w-1 h-1 rounded-full bg-emerald-500 absolute -bottom-0.5" />
          )}
        </button>

        {/* Center Quick Event Add Floating Action */}
        <button
          id="mobile-add-event-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenNewEventModal();
          }}
          className="w-10 h-10 -mt-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-md shadow-black/20 hover:scale-105 active:scale-95 transition-all"
          title="Create New Event"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Student Roster Tab */}
        <button
          id="mobile-tab-roster"
          onClick={() => {
            soundFx.playClick();
            onTabChange('roster');
          }}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            currentTab === 'roster'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Roster</span>
          {currentTab === 'roster' && (
            <span className="w-1 h-1 rounded-full bg-emerald-500 absolute -bottom-0.5" />
          )}
        </button>

        {/* Android App Button */}
        <button
          id="mobile-tab-android"
          onClick={() => {
            soundFx.playClick();
            onOpenAndroidModal();
          }}
          className="relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all"
          title="Android App Info & Install"
        >
          <div className="relative">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            {isPwaInstallable && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-ping" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Android</span>
        </button>
      </div>
    </div>
  );
};
