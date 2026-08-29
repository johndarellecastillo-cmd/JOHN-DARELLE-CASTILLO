import React, { useState } from 'react';
import { Calendar, MapPin, X, Plus } from 'lucide-react';
import { EventItem } from '../types';
import { Storage } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventItem) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an event title.');
      return;
    }

    const created = Storage.createEvent({
      title: title.trim(),
      date: date || new Date().toISOString().split('T')[0],
      venue: venue.trim() || undefined,
      description: description.trim() || undefined,
    });

    soundFx.playTimeIn();
    onEventCreated(created);
    onClose();

    // Reset
    setTitle('');
    setVenue('');
    setDescription('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-200/50 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-md flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Create New Attendance Event
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs backdrop-blur-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Student Assembly 2025"
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Venue / Room
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Auditorium Hall"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about the activity..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 hover:opacity-90 flex items-center gap-1.5 backdrop-blur-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
