import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
  isStandalone: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPwa,
  isStandalone,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const capacitorConfig = `{
  "appId": "com.attendance.tracker.app",
  "appName": "Student Attendance Tracker",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}`;

  const copyToClipboard = (text: string, id: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white/90 dark:bg-zinc-900/90 border border-white/40 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200/50 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-md flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Android App Setup
                {isStandalone && (
                  <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Installed & Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Install as a native Android PWA or build an APK
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Tabs */}
        <div className="px-5 pt-4 pb-0 flex gap-2 border-b border-zinc-200/40 dark:border-white/5 bg-white/30 dark:bg-white/5">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('pwa');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Android Install (Recommended)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('apk');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'apk'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Build APK / Google Play</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              {/* Direct Install CTA */}
              {deferredPrompt ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        1-Click Android App Install
                      </h4>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        Adds full-screen launcher icon with offline camera scanner.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onInstallPwa}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                  >
                    Install Now
                  </button>
                </div>
              ) : isStandalone ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>You are currently running the app in standalone native Android mode!</span>
                </div>
              ) : null}

              {/* Android Features Card */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border border-white/40 dark:border-white/10 backdrop-blur-md space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Android Native Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Full-Screen Scanner</strong> with Android rear & front camera switching</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Haptic Vibration</strong> feedback on successful scans and warnings</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Offline Storage</strong> & Service Worker caching for spotty event Wi-Fi</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Bottom Navigation</strong> optimized for one-handed thumb use</span>
                  </div>
                </div>
              </div>

              {/* Manual Install Instructions for Android Chrome */}
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-zinc-800/40 border border-white/30 dark:border-white/10 backdrop-blur-md space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  How to install on your Android Phone:
                </h4>
                <ol className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Open this URL in <strong>Google Chrome</strong> on your Android phone.
                  </li>
                  <li>
                    Tap the <strong>three dots menu (⋮)</strong> at the top right of Chrome.
                  </li>
                  <li>
                    Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </li>
                  <li>
                    Tap <strong>Install</strong>. The Attendance app icon will appear directly on your home screen!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs">
                <p className="font-semibold mb-1">Package into a standalone Android APK (.apk) or Bundle (.aab)</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  You can package this Vite React app into a native Android Studio project using Capacitor or Bubblewrap (Google TWA).
                </p>
              </div>

              {/* Step 1: Install Capacitor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    1. Initialize Capacitor in project:
                  </span>
                  <button
                    onClick={() => copyToClipboard('npm i @capacitor/core @capacitor/android @capacitor/cli\nnpx cap init "Student Attendance Tracker" "com.attendance.tracker.app" --web-dir=dist\nnpx cap add android', 'step1')}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedCode === 'step1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'step1' ? 'Copied' : 'Copy commands'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800">
                  npm i @capacitor/core @capacitor/android @capacitor/cli{'\n'}
                  npx cap init "Student Attendance Tracker" "com.attendance.tracker.app" --web-dir=dist{'\n'}
                  npx cap add android
                </pre>
              </div>

              {/* Step 2: Build & Sync */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    2. Build & open in Android Studio:
                  </span>
                  <button
                    onClick={() => copyToClipboard('npm run build\nnpx cap sync\nnpx cap open android', 'step2')}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedCode === 'step2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'step2' ? 'Copied' : 'Copy commands'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800">
                  npm run build{'\n'}
                  npx cap sync{'\n'}
                  npx cap open android
                </pre>
              </div>

              {/* Step 3: capacitor.config.json */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    capacitor.config.json template:
                  </span>
                  <button
                    onClick={() => copyToClipboard(capacitorConfig, 'config')}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedCode === 'config' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'config' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800">
                  {capacitorConfig}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200/50 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Android 8.0+ / Chrome 80+ supported
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 text-xs font-semibold backdrop-blur-sm hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
