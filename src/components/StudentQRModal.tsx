import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, X, User, Printer, Check } from 'lucide-react';
import { Student } from '../types';
import { soundFx } from '../utils/audio';

interface StudentQRModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentQRModal: React.FC<StudentQRModalProps> = ({ student, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!student) return;

    // Generate JSON payload or raw student ID for maximum compatibility
    const qrPayload = student.studentId;

    QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#18181b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code', err));
  }, [student]);

  if (!student) return null;

  const handleDownloadQR = () => {
    soundFx.playClick();
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR_${student.studentId}_${student.fullName.replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyId = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(student.studentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200/50 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-white/40 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 backdrop-blur-md">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
              Student QR Pass
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Digital ID Card Preview */}
        <div className="p-6 text-center space-y-4">
          <div className="p-5 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-md flex flex-col items-center shadow-xs">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Student QR"
                className="w-48 h-48 rounded-2xl bg-white p-3 shadow-sm border border-zinc-200/80 dark:border-white/10"
              />
            ) : (
              <div className="w-48 h-48 bg-white/40 animate-pulse rounded-2xl" />
            )}

            <div className="mt-3.5">
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                {student.fullName}
              </h4>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{student.studentId}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-1">
                {student.program}
              </p>
              {student.yearLevel && (
                <span className="inline-block text-[10px] text-zinc-500 mt-0.5">
                  {student.yearLevel}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyId}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-white/60 dark:bg-zinc-800/60 hover:bg-white/90 dark:hover:bg-zinc-700/80 border border-white/40 dark:border-white/10 text-zinc-800 dark:text-zinc-200 transition-colors backdrop-blur-md shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <User className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied ID!' : 'Copy ID'}</span>
            </button>

            <button
              onClick={handleDownloadQR}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900/90 dark:bg-white/90 hover:opacity-90 text-white dark:text-zinc-900 transition-opacity backdrop-blur-sm shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
