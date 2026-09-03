import React from 'react';
import { SAMPLE_FILES, SampleFilePreset } from '../../lib/sampleFiles';
import { ShieldAlert, ArrowRight, Sparkles, MapPin, Camera, User, FileText } from 'lucide-react';

interface SampleFilesSectionProps {
  onSelectSample: (preset: SampleFilePreset) => void;
  isLoading?: boolean;
}

export const SampleFilesSection: React.FC<SampleFilesSectionProps> = ({ onSelectSample, isLoading }) => {
  return (
    <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 sm:p-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-base sm:text-lg font-bold text-white">Pre-Loaded Metadata Scenarios</h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Don't have a photo with GPS or EXIF handy? Load an authentic pre-configured scenario to see immediate threat vector analysis.
          </p>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 self-start sm:self-auto bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
          Instant Local Presets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SAMPLE_FILES.map((sample) => (
          <button
            key={sample.id}
            id={`btn-sample-${sample.id}`}
            disabled={isLoading}
            onClick={() => onSelectSample(sample)}
            className="group p-4 bg-[#080808] hover:bg-[#121215] border border-white/5 hover:border-amber-500/40 rounded-xl text-left transition-all duration-200 flex flex-col justify-between cursor-pointer disabled:opacity-50"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-zinc-300 truncate group-hover:text-white transition-colors">
                  {sample.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                  {sample.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
                {sample.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-500 group-hover:text-amber-400 flex items-center gap-1 font-medium">
                Inspect Binary <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {sample.riskHint}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

