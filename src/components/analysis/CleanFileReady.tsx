import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, Download, CheckCircle2, FileCheck, RefreshCw, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { CleanResult } from '../../types';
import { formatFileSize } from '../../lib/metadata/image';

interface CleanFileReadyProps {
  result: CleanResult;
  onReset: () => void;
  previewUrl?: string;
}

export const CleanFileReady: React.FC<CleanFileReadyProps> = ({
  result,
  onReset,
  previewUrl,
}) => {
  useEffect(() => {
    // Fire confetti on render
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#22C55E', '#FFFFFF', '#D97706'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.cleanUrl;
    link.download = result.cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] font-sans space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <ShieldCheck className="w-8 h-8 animate-pulse" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PRIVACY SANITIZATION COMPLETED</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Sanitized File Generated
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          All selected telemetry, EXIF tags, and geographic vectors have been wiped client-side.
        </p>
      </div>

      {/* Filename Anonymization Banner if performed */}
      {result.isFilenameAnonymized && (
        <div className="p-4 bg-[#080808] border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Filename Footprint Anonymized</span>
              </div>
              <div className="text-zinc-400 text-[11px] mt-0.5 flex flex-wrap items-center gap-1.5 font-mono">
                <span className="text-zinc-500 line-through truncate max-w-[200px]">{result.originalFileName}</span>
                <ArrowRight className="w-3 h-3 text-amber-500" />
                <span className="text-white font-semibold">{result.cleanFileName}</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold uppercase">
            Secured
          </span>
        </div>
      )}

      {/* Before / After Comparison Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
        {/* Before Card */}
        <div className="p-5 bg-red-950/20 border border-red-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
              ORIGINAL RAW BUFFER
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
              {result.beforeRiskLevel.toUpperCase()}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {result.beforeScore} <span className="text-xs text-zinc-500">/ 100 Risk</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
            Contained sensitive EXIF tags, GPS coordinates, or platform timeline footprints.
          </p>
          <div className="text-[11px] text-zinc-500 pt-1 border-t border-white/5">
            Size: {formatFileSize(result.originalSize)}
          </div>
        </div>

        {/* After Card */}
        <div className="p-5 bg-[#080808] border border-amber-500/40 rounded-xl space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SANITIZED ARTIFACT
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              {result.afterRiskLevel.toUpperCase()}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {result.afterScore} <span className="text-xs text-zinc-500">/ 100 Risk</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
            Zero telemetry traces. Completely safe for public sharing on social channels and repositories.
          </p>
          <div className="text-[11px] text-emerald-400 pt-1 border-t border-white/5">
            Size: {formatFileSize(result.cleanSize)}
          </div>
        </div>
      </div>

      {/* Summary of Removed Categories */}
      <div className="p-4 bg-[#080808] border border-white/5 rounded-xl space-y-2 font-mono">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Sanitization Log Verification
        </h4>
        <div className="flex flex-wrap gap-2 pt-1">
          {result.removedCategories.map((cat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-emerald-400"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{cat} Cleared</span>
            </span>
          ))}
        </div>
      </div>

      {/* Download Action Area */}
      <div className="space-y-3 pt-2">
        <button
          id="btn-download-clean-file"
          onClick={handleDownload}
          className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-sm sm:text-base rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Download Clean File ({result.cleanFileName})</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500 px-1">
          <span className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            Original source buffer preserved untouched.
          </span>
          <button
            id="btn-scan-another-file"
            onClick={onReset}
            className="text-zinc-400 hover:text-white underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            Scan another file
          </button>
        </div>
      </div>
    </div>
  );
};
