import React, { useState, useEffect } from 'react';
import { ShieldAlert, MapPin, Smartphone, Calendar, FileCode, CheckCircle2, Cpu, Activity } from 'lucide-react';

export const HeroVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-xs">
      {/* Ambient background glow */}
      <div className="absolute -right-20 -top-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header line */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 glow-dot-amber" />
          <span className="text-white font-bold tracking-wider text-[11px] uppercase">
            LIVE METADATA THREAT SIMULATOR
          </span>
        </div>
        <span className="text-zinc-500 text-[10px] uppercase tracking-wider">CLIENT SANDBOX</span>
      </div>

      {/* Amber scanning line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80 animate-scanline pointer-events-none" />

      {/* Diagram Container */}
      <div className="flex flex-col items-center space-y-3.5 relative">
        
        {/* Step 1: File Scan Node */}
        <div
          className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-500 flex items-center justify-between ${
            activeStep >= 0
              ? 'bg-[#121215] border-amber-500/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'bg-[#080808] border-white/5 text-zinc-500'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileCode className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-zinc-200">SAMPLE_CAMERA_RAW.JPG</span>
          </div>
          <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            4.2 MB • EXIF+GPS
          </span>
        </div>

        {/* Vertical connector */}
        <div className="w-px h-4 bg-gradient-to-b from-amber-500/80 to-white/10" />

        {/* Step 2: Extracted Metadata Nodes */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* GPS Node */}
          <div
            className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-500 ${
              activeStep >= 1
                ? 'bg-red-950/20 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                : 'bg-[#080808] border-white/5'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
            </div>
            <span className="text-[10px] font-semibold text-zinc-200">GPS TAG</span>
            <span className="text-[9px] text-red-400 font-bold mt-0.5 font-mono">37.7749° N</span>
            <span className="text-[9px] text-zinc-500">EXIF Lat/Lon</span>
            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 glow-dot-red" />
          </div>

          {/* Device Node */}
          <div
            className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-500 ${
              activeStep >= 1
                ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                : 'bg-[#080808] border-white/5'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-[10px] font-semibold text-zinc-200">DEVICE HW</span>
            <span className="text-[9px] text-amber-400 font-bold mt-0.5">iPhone 15 Pro</span>
            <span className="text-[9px] text-zinc-500">S/N Exposed</span>
            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 glow-dot-amber" />
          </div>

          {/* Date Node */}
          <div
            className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-500 ${
              activeStep >= 1
                ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                : 'bg-[#080808] border-white/5'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-[10px] font-semibold text-zinc-200">DATETIME</span>
            <span className="text-[9px] text-amber-400 font-bold mt-0.5">Aug 14, 17:42</span>
            <span className="text-[9px] text-zinc-500">Original Log</span>
            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 glow-dot-amber" />
          </div>
        </div>

        {/* Downward connector */}
        <div className="w-px h-4 bg-gradient-to-b from-white/10 to-amber-500/80" />

        {/* Step 3: Privacy Risk Output */}
        <div
          className={`w-full p-4 rounded-xl border transition-all duration-500 flex items-center justify-between ${
            activeStep >= 2
              ? 'bg-[#121215] border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              : 'bg-[#080808] border-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">PRIVACY THREAT VECTOR</div>
              <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base">72 / 100</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 font-mono">
                  HIGH EXPOSURE
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lossless Clean</span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">1-Click Strip</span>
          </div>
        </div>
      </div>

      {/* Footer live status ticker */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-dot-green"></span>
          Stateless Memory Buffer
        </span>
        <span>0ms Network Transfer</span>
      </div>
    </div>
  );
};

