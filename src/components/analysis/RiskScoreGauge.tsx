import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, FileText } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskScoreGaugeProps {
  score: number;
  level: RiskLevel;
  risksCount: number;
  onOpenReport: () => void;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  level,
  risksCount,
  onOpenReport,
}) => {
  const getLevelDetails = () => {
    switch (level) {
      case 'critical':
        return {
          label: 'CRITICAL THREAT',
          color: '#EF4444',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          icon: ShieldAlert,
          description: 'High-precision GPS coordinates, owner identity, or device serials detected. High risk of deanonymization if shared.',
        };
      case 'high':
        return {
          label: 'HIGH THREAT',
          color: '#F97316',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          textColor: 'text-orange-400',
          icon: ShieldAlert,
          description: 'Location data or explicit personal identity metadata detected in file headers.',
        };
      case 'elevated':
        return {
          label: 'ELEVATED EXPOSURE',
          color: '#F59E0B',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          textColor: 'text-amber-400',
          icon: AlertTriangle,
          description: 'Device specifications, camera profiles, and exact capture dates are exposed.',
        };
      case 'moderate':
        return {
          label: 'MODERATE EXPOSURE',
          color: '#FBBF24',
          bgColor: 'bg-amber-400/10',
          borderColor: 'border-amber-400/30',
          textColor: 'text-amber-300',
          icon: AlertTriangle,
          description: 'Basic timestamps, camera settings or software traces found. Moderate privacy exposure.',
        };
      case 'low':
      default:
        return {
          label: 'LOW / SANITIZED',
          color: '#22C55E',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-400',
          icon: ShieldCheck,
          description: 'File contains negligible or zero sensitive metadata.',
        };
    }
  };

  const details = getLevelDetails();
  const Icon = details.icon;

  // Circular gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between font-sans shadow-lg">
      {/* Top row */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${details.textColor}`} />
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.15em] font-mono">
              Privacy Risk Rating
            </h3>
          </div>
          <button
            id="btn-view-privacy-report"
            onClick={onOpenReport}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Audit Report</span>
          </button>
        </div>

        {/* Gauge Centerpiece */}
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          {/* Circular SVG Gauge */}
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-[#18181B]"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={details.color}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-white font-mono">{score}</span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">/ 100</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold font-mono border" style={{ backgroundColor: `${details.color}15`, borderColor: `${details.color}40`, color: details.color }}>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: details.color }} />
              {details.label}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {details.description}
            </p>
            <div className="text-xs font-mono text-zinc-500 pt-1">
              Found <strong className="text-white">{risksCount}</strong> threat factor{risksCount === 1 ? '' : 's'} requiring review.
            </div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span>Metric: 0 (Safe) to 100 (Critical)</span>
        <span className="text-amber-500">Autonomous Vector Model</span>
      </div>
    </div>
  );
};

