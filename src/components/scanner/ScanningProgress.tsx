import React, { useEffect, useState } from 'react';
import { ShieldAlert, Check, Loader2, FileCode, Cpu, Activity } from 'lucide-react';

interface ScanningProgressProps {
  fileName: string;
  fileSize: number;
  onComplete: () => void;
}

export const ScanningProgress: React.FC<ScanningProgressProps> = ({
  fileName,
  fileSize,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Reading raw binary headers and byte segments', time: 350 },
    { label: 'Extracting EXIF, IPTC, XMP and ICC chunks', time: 400 },
    { label: 'Scanning geographic coordinates and hardware serials', time: 350 },
    { label: 'Calculating privacy threat vectors & risk score', time: 300 },
    { label: 'Compiling interactive security audit report', time: 250 },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStep < steps.length) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, steps[currentStep].time);
    } else {
      timer = setTimeout(() => {
        onComplete();
      }, 200);
    }
    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100));

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden font-mono">
      {/* Top scanner glow bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-amber-500 shadow-[0_0_15px_#f59e0b] animate-pulse" />

      {/* Target File Info */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-5 mb-6">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500">
          <Cpu className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium">
            IN-MEMORY BINARY PARSING
          </div>
          <h3 className="text-base font-bold text-white truncate max-w-sm mt-0.5">{fileName}</h3>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2 text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider">Parsing Buffer</span>
          <span className="text-amber-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#121215] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Checklist */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs p-2.5 rounded-lg transition-colors ${
                isDone
                  ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/20'
                  : isCurrent
                  ? 'text-white bg-[#121215] border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                  : 'text-zinc-600'
              }`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {isDone ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                )}
              </div>
              <span className="flex-1 truncate text-xs">{step.label}</span>
              {isDone && <span className="text-[10px] text-emerald-400 font-bold">READY</span>}
            </div>
          );
        })}
      </div>

      {/* Bottom status note */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-dot-green"></span>
          Thread: Local WebWorker
        </span>
        <span className="text-zinc-400">Zero Remote Exfiltration</span>
      </div>
    </div>
  );
};

