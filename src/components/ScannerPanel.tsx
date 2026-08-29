import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Search,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { AttendanceRecord, EventItem, ScanMode, Student, VerificationResult } from '../types';
import { Storage } from '../utils/storage';
import { soundFx } from '../utils/audio';

interface ScannerPanelProps {
  activeEvent: EventItem | null;
  logs: AttendanceRecord[];
  onNewLogAdded: (record: AttendanceRecord) => void;
  onSwitchToRoster: () => void;
}

export const ScannerPanel: React.FC<ScannerPanelProps> = ({
  activeEvent,
  logs,
  onNewLogAdded,
  onSwitchToRoster,
}) => {
  // Mode Selector: TIME_IN vs TIME_OUT
  const [scanMode, setScanMode] = useState<ScanMode>('TIME_IN');
  
  // Camera scanning state
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  // Manual input state
  const [manualInput, setManualInput] = useState<string>('');
  const [manualError, setManualError] = useState<string | null>(null);

  // Live verification state
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [verificationCountdown, setVerificationCountdown] = useState<number>(0);
  
  // Quick test demo modal / drawer
  const [showDemoQRs, setShowDemoQRs] = useState<boolean>(false);

  // References
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const lastScannedIdRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setAvailableCameras(devices.map((d) => ({ id: d.id, label: d.label || `Camera ${d.id.slice(0, 4)}` })));
          // Prefer back camera if available, otherwise first camera
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn('Unable to query camera list', err);
      });

    return () => {
      stopCameraScanner();
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Handle countdown for verification card dismissal
  useEffect(() => {
    if (!verification) return;
    setVerificationCountdown(100);
    const interval = setInterval(() => {
      setVerificationCountdown((prev) => {
        if (prev <= 5) {
          clearInterval(interval);
          return 0;
        }
        return prev - 5;
      });
    }, 150); // 3 seconds total

    return () => clearInterval(interval);
  }, [verification]);

  // Start html5-qrcode camera
  const startCameraScanner = async (cameraId?: string) => {
    setCameraError(null);
    const camId = cameraId || selectedCameraId;

    try {
      if (html5QrCodeRef.current) {
        await stopCameraScanner();
      }

      const qrScanner = new Html5Qrcode('qr-reader-container', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      html5QrCodeRef.current = qrScanner;

      const cameraConfig = camId ? { deviceId: { exact: camId } } : { facingMode: 'environment' };

      await qrScanner.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecodedPayload(decodedText, 'qr_scanner');
        },
        () => {
          // ignore scan frame errors
        }
      );

      setIsScannerActive(true);
    } catch (err: unknown) {
      console.error('Camera start error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setCameraError(
        errMsg.includes('NotAllowedError') || errMsg.includes('Permission')
          ? 'Camera permission was denied. Please allow camera access in browser settings or use Quick Manual Lookup.'
          : 'Unable to start camera. Please verify device camera availability or use manual lookup.'
      );
      setIsScannerActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
    html5QrCodeRef.current = null;
    setIsScannerActive(false);
  };

  const toggleCamera = () => {
    soundFx.playClick();
    if (isScannerActive) {
      stopCameraScanner();
    } else {
      startCameraScanner();
    }
  };

  // Process decoded QR or manual entry payload
  const handleDecodedPayload = (rawPayload: string, source: 'qr_scanner' | 'manual_entry') => {
    if (!activeEvent) {
      setCameraError('Please select or create an active event first.');
      return;
    }

    const payload = rawPayload.trim();
    if (!payload) return;

    // Debounce duplicate scans within 2.5 seconds
    const now = Date.now();
    if (
      source === 'qr_scanner' &&
      lastScannedIdRef.current.id === payload &&
      now - lastScannedIdRef.current.time < 2500
    ) {
      return;
    }

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    lastScannedIdRef.current = { id: payload, time: now };

    // Try to parse payload as JSON (if exported as QR object) or extract studentId
    let studentIdToFind = payload;
    let fallbackName = '';
    let fallbackProgram = '';

    try {
      if (payload.startsWith('{') && payload.endsWith('}')) {
        const parsed = JSON.parse(payload);
        if (parsed.studentId) studentIdToFind = parsed.studentId;
        if (parsed.fullName) fallbackName = parsed.fullName;
        if (parsed.program) fallbackProgram = parsed.program;
      }
    } catch {
      // Use raw payload as string ID
    }

    // Look up student in registered roster
    let student = Storage.findStudentById(studentIdToFind);

    if (!student) {
      // If student is not in roster yet, gracefully register on-the-fly or fallback
      student = {
        id: 'std-' + Date.now(),
        studentId: studentIdToFind,
        fullName: fallbackName || `Guest Student (${studentIdToFind})`,
        program: fallbackProgram || 'General Participant',
        createdAt: new Date().toISOString(),
      };
      // Auto-register to roster for future recognition
      Storage.addStudent(student);
    }

    // Check recent history for duplicates in current event
    const eventLogs = Storage.getLogs(activeEvent.id);
    const existingSameAction = eventLogs.find(
      (log) => log.studentId === student!.studentId && log.type === scanMode
    );

    // Save attendance log
    const savedRecord = Storage.addLog({
      eventId: activeEvent.id,
      studentId: student.studentId,
      fullName: student.fullName,
      program: student.program,
      type: scanMode,
      source,
    });

    onNewLogAdded(savedRecord);

    // Play synthesized sound cue
    if (scanMode === 'TIME_IN') {
      soundFx.playTimeIn();
    } else {
      soundFx.playTimeOut();
    }

    // Display live verification card
    setVerification({
      student,
      type: scanMode,
      timestamp: savedRecord.formattedTime || new Date().toLocaleTimeString(),
      recordId: savedRecord.id,
      isDuplicate: !!existingSameAction,
      statusMessage: existingSameAction
        ? `Note: ${student.fullName} has already recorded ${scanMode === 'TIME_IN' ? 'Time In' : 'Time Out'} earlier.`
        : undefined,
    });

    // Clear manual input
    setManualInput('');
    setManualError(null);

    // Auto reset scanner state after 3 seconds
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setVerification(null);
      isProcessingRef.current = false;
    }, 3200);

    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      setManualError('Please enter a Student ID or Name');
      return;
    }
    soundFx.playClick();
    handleDecodedPayload(manualInput, 'manual_entry');
  };

  // Recent 3 to 5 scans for active event
  const recentLogs = logs.slice(0, 4);

  // All registered roster students for quick test simulator
  const rosterStudents = Storage.getRoster();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* 1. Mode Selector */}
      <div className="flex items-center justify-center">
        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 dark:border-white/10 inline-flex shadow-sm">
          <button
            id="mode-time-in-btn"
            onClick={() => {
              soundFx.playClick();
              setScanMode('TIME_IN');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              scanMode === 'TIME_IN'
                ? 'bg-emerald-600/90 text-white shadow-sm ring-2 ring-emerald-500/20 backdrop-blur-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                scanMode === 'TIME_IN' ? 'bg-white' : 'bg-emerald-500'
              }`}
            />
            <span>TIME IN</span>
          </button>

          <button
            id="mode-time-out-btn"
            onClick={() => {
              soundFx.playClick();
              setScanMode('TIME_OUT');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              scanMode === 'TIME_OUT'
                ? 'bg-amber-500/90 text-white shadow-sm ring-2 ring-amber-500/20 backdrop-blur-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                scanMode === 'TIME_OUT' ? 'bg-white' : 'bg-amber-500'
              }`}
            />
            <span>TIME OUT</span>
          </button>
        </div>
      </div>

      {/* 2. Camera Viewport & Centered Card */}
      <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 shadow-xl shadow-black/5 overflow-hidden relative">
        <div className="p-5 sm:p-6 flex flex-col items-center">
          {/* Header Info Inside Card */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                  scanMode === 'TIME_IN'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Active Mode: {scanMode === 'TIME_IN' ? 'Time In' : 'Time Out'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {availableCameras.length > 1 && isScannerActive && (
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    startCameraScanner(e.target.value);
                  }}
                  className="text-xs bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl px-2.5 py-1 text-zinc-700 dark:text-zinc-300 outline-hidden"
                >
                  {availableCameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label}
                    </option>
                  ))}
                </select>
              )}

              <button
                id="camera-power-btn"
                onClick={toggleCamera}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
                  isScannerActive
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/25'
                    : 'bg-zinc-900/90 text-white dark:bg-white/90 dark:text-zinc-900 border-transparent hover:opacity-90 shadow-xs'
                }`}
              >
                {isScannerActive ? (
                  <>
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Pause Camera</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Start Camera</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Camera Frame / Viewport */}
          <div className="w-full max-w-sm aspect-square relative rounded-2xl overflow-hidden bg-zinc-950/95 flex items-center justify-center border border-white/20 dark:border-white/10 shadow-inner">
            {/* HTML5 QR Code Mount point */}
            <div
              id="qr-reader-container"
              className={`w-full h-full ${!isScannerActive ? 'hidden' : ''}`}
            />

            {/* Inactive or Error Overlay */}
            {!isScannerActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-zinc-400 bg-zinc-950/80 backdrop-blur-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-zinc-200 backdrop-blur-md">
                  <QrCode className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-200">Camera Standby</p>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Click Start Camera above, or type an ID number in the manual input below.
                  </p>
                </div>
                <button
                  onClick={toggleCamera}
                  className="mt-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-zinc-100 transition-colors flex items-center gap-1.5 backdrop-blur-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Activate Scanner</span>
                </button>
              </div>
            )}

            {/* Active Scanning Visual Guides & Laser */}
            {isScannerActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
                {/* 4 Corner Markers */}
                <div className="relative w-56 h-56 border-2 border-dashed border-emerald-500/40 rounded-2xl flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-lg" />

                  {/* Laser Scan Animation */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-scan-laser" />
                </div>
              </div>
            )}
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="mt-3 w-full max-w-sm p-3 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{cameraError}</p>
              </div>
              <button
                onClick={() => setCameraError(null)}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Manual Lookup Form */}
          <div className="w-full max-w-sm mt-5">
            <form onSubmit={handleManualSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3.5 text-zinc-400 pointer-events-none" />
                <input
                  id="manual-id-input"
                  type="text"
                  value={manualInput}
                  onChange={(e) => {
                    setManualInput(e.target.value);
                    if (manualError) setManualError(null);
                  }}
                  placeholder="Manual lookup by ID (e.g. 2024-10021)..."
                  className="w-full pl-9 pr-12 py-2.5 rounded-xl text-xs sm:text-sm bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-mono"
                />
                <button
                  type="submit"
                  title="Submit Entry"
                  className="absolute right-1.5 w-7 h-7 rounded-lg bg-zinc-900/90 dark:bg-white/90 text-white dark:text-zinc-900 flex items-center justify-center hover:opacity-90 transition-opacity backdrop-blur-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {manualError && (
                <p className="text-[11px] text-rose-500 mt-1 pl-1">{manualError}</p>
              )}
            </form>

            {/* Quick Demo Simulator Toggle Button */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1">
              <span>Roster: {rosterStudents.length} registered students</span>
              <button
                type="button"
                onClick={() => setShowDemoQRs(!showDemoQRs)}
                className="hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 font-medium underline underline-offset-2"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Test 1-Click Scan</span>
              </button>
            </div>

            {/* 1-Click Scan Test Drawer */}
            {showDemoQRs && (
              <div className="mt-3 p-3 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/40 dark:border-white/10 text-xs animate-in fade-in slide-in-from-top-2 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-200/50 dark:border-white/5">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Quick Simulate Student Scan
                  </span>
                  <button
                    onClick={() => setShowDemoQRs(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {rosterStudents.slice(0, 6).map((student) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        handleDecodedPayload(student.studentId, 'manual_entry');
                      }}
                      className="w-full text-left p-2 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/40 dark:border-white/5 flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="truncate">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate block">
                          {student.fullName}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {student.studentId} • {student.program}
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/70 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border border-white/30 dark:border-white/5">
                        Scan
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Live Verification Card: Displays ONLY when a scan occurs */}
        {verification && (
          <div
            id="live-verification-card"
            className="border-t border-white/40 dark:border-white/10 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-3 duration-200 relative overflow-hidden"
          >
            {/* Auto-reset progress bar */}
            <div
              className="absolute top-0 left-0 h-1 bg-emerald-500 dark:bg-emerald-400 transition-all duration-150 ease-linear"
              style={{ width: `${verificationCountdown}%` }}
            />

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm backdrop-blur-md ${
                  verification.type === 'TIME_IN'
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-amber-500/90 text-white'
                }`}
              >
                <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-md ${
                      verification.type === 'TIME_IN'
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {verification.type === 'TIME_IN' ? 'TIME IN' : 'TIME OUT'} •{' '}
                    {verification.timestamp}
                  </span>

                  <span className="text-[11px] font-mono text-zinc-400">
                    ID: {verification.student.studentId}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                  {verification.student.fullName}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate">
                  {verification.student.program}
                  {verification.student.yearLevel ? ` • ${verification.student.yearLevel}` : ''}
                </p>

                {verification.statusMessage && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-1">
                    {verification.statusMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Compact Recent Activity Feed: Last 3-5 scans below camera */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
              Recent Scans
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md text-zinc-600 dark:text-zinc-300 font-semibold border border-white/40 dark:border-white/10">
              {logs.length} Total
            </span>
          </div>

          {logs.length > 0 && (
            <button
              onClick={() => {
                const eventId = activeEvent?.id;
                if (eventId && window.confirm('Clear recent activity logs for this event?')) {
                  Storage.saveLogs(eventId, []);
                  window.location.reload();
                }
              }}
              className="text-[11px] text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-6 rounded-3xl border border-dashed border-white/40 dark:border-white/10 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md text-center text-zinc-400 dark:text-zinc-500 text-xs">
            <p>No scans recorded for this event yet.</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Active scans will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/40 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs hover:bg-white/70 dark:hover:bg-zinc-900/70 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold backdrop-blur-md ${
                      log.type === 'TIME_IN'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    {log.type === 'TIME_IN' ? 'IN' : 'OUT'}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {log.fullName}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                      {log.studentId} • {log.program}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {log.formattedTime || 'Just now'}
                  </span>
                  <span className="block text-[10px] text-zinc-400 capitalize">
                    {log.source === 'qr_scanner' ? 'QR Scan' : 'Manual'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
