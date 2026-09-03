import React from 'react';
import { ShieldAlert, MapPin, Smartphone, User, Calendar, Trash2, FileWarning, Check, ShieldCheck, Tag } from 'lucide-react';
import { PrivacyRisk } from '../../types';

interface SensitiveDataListProps {
  risks: PrivacyRisk[];
  onRemoveRisk: (riskId: string) => void;
  removedRiskIds?: string[];
}

export const SensitiveDataList: React.FC<SensitiveDataListProps> = ({
  risks,
  onRemoveRisk,
  removedRiskIds = [],
}) => {
  if (risks.length === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
          <Check className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white mb-1">No Critical Sensitive Data Detected</h4>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          No embedded GPS coordinates, author accounts, or unique hardware serials were detected in this file.
        </p>
      </div>
    );
  }

  const getRiskIcon = (riskId: string, category: string) => {
    if (riskId === 'risk-filename') return Tag;
    switch (category.toLowerCase()) {
      case 'location privacy':
        return MapPin;
      case 'personal identity':
        return User;
      case 'device fingerprinting':
      case 'device privacy':
        return Smartphone;
      case 'timeline privacy':
        return Calendar;
      default:
        return FileWarning;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-red-500/10 text-red-400 border-red-500/30',
          dot: 'bg-red-500',
          label: 'CRITICAL',
        };
      case 'high':
        return {
          badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          dot: 'bg-orange-500',
          label: 'HIGH',
        };
      case 'elevated':
      case 'moderate':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          label: 'MODERATE',
        };
      default:
        return {
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-500',
          label: 'LOW',
        };
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 font-sans">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-white uppercase tracking-[0.15em] font-mono">
            Sensitive Vectors Detected ({risks.length})
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Audit Breakdown</span>
      </div>

      <div className="space-y-3">
        {risks.map((risk) => {
          const Icon = getRiskIcon(risk.id, risk.category);
          const style = getSeverityStyle(risk.severity);
          const isRemoved = removedRiskIds.includes(risk.id);

          return (
            <div
              key={risk.id}
              className={`p-4 rounded-xl border transition-all ${
                isRemoved
                  ? 'bg-[#080808] border-white/5 opacity-50'
                  : 'bg-[#0D0D10] border-white/5 hover:border-amber-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                    <Icon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{risk.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                      {risk.description}
                    </p>
                    <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                      <span className="text-amber-500">Fix Recommendation:</span> {risk.recommendation}
                    </div>
                  </div>
                </div>

                <div className="sm:self-center">
                  {isRemoved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" /> Stripped
                    </span>
                  ) : (
                    <button
                      id={`btn-remove-risk-${risk.id}`}
                      onClick={() => onRemoveRisk(risk.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-amber-400 hover:text-black bg-amber-500/10 hover:bg-amber-400 border border-amber-500/30 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      {risk.id === 'risk-filename' ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Anonymize Filename</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Field</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
