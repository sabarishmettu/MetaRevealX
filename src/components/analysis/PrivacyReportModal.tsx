import React from 'react';
import { X, Printer, Download, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { FileAnalysis } from '../../types';
import { formatFileSize } from '../../lib/metadata/image';

interface PrivacyReportModalProps {
  analysis: FileAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyReportModal: React.FC<PrivacyReportModalProps> = ({
  analysis,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080808]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              MetaShield Privacy Audit Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-[#050505]">
          {/* Header Box */}
          <div className="border border-white/10 p-4 rounded-xl bg-[#080808] space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-zinc-500">
              <span>AUDIT ID: MS-{Date.now().toString(36).toUpperCase()}</span>
              <span>DATE: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Target File</span>
                <strong className="text-white text-sm truncate block">{analysis.fileName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">File Size & Type</span>
                <span className="text-zinc-400">{formatFileSize(analysis.fileSize)} • {analysis.mimeType}</span>
              </div>
            </div>
          </div>

          {/* Score Box */}
          <div className="border border-amber-500/30 p-4 rounded-xl bg-amber-500/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                Calculated Privacy Threat Score
              </span>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {analysis.privacyScore} <span className="text-xs text-zinc-500">/ 100</span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {analysis.riskLevel.toUpperCase()} RISK
            </span>
          </div>

          {/* Sensitive Data Found */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Identified Risk Vectors ({analysis.risks.length})</span>
            </h4>
            <div className="space-y-2">
              {analysis.risks.length === 0 ? (
                <p className="text-zinc-500 italic">No high-risk metadata tags discovered.</p>
              ) : (
                analysis.risks.map((risk) => (
                  <div key={risk.id} className="p-3 bg-[#080808] border border-white/10 rounded-lg">
                    <div className="font-bold text-white mb-0.5 flex items-center justify-between">
                      <span>{risk.title}</span>
                      <span className="text-[10px] text-amber-400 uppercase font-mono">{risk.severity}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{risk.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Recommended Remediation Steps
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-zinc-400 bg-[#080808] p-4 rounded-xl border border-white/5 font-sans">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed text-[11px]">
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="pt-4 border-t border-white/5 text-[10px] text-zinc-600 leading-relaxed font-sans">
            * This report is an automated client-side privacy estimate based on detected EXIF, XMP, IPTC, and PDF metadata headers. MetaShield never transfers, archives, or logs file contents.
          </div>
        </div>
      </div>
    </div>
  );
};
