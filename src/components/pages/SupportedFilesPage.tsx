import React from 'react';
import { FileText, CheckCircle2, Clock, ShieldAlert, ArrowRight, Image, FileCode, Music, Video, Lock } from 'lucide-react';
import { SUPPORTED_FORMATS } from '../../lib/supportedFormats';

interface SupportedFilesPageProps {
  onScanClick: () => void;
}

export const SupportedFilesPage: React.FC<SupportedFilesPageProps> = ({ onScanClick }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400">
          <FileText className="w-3.5 h-3.5 text-amber-500" />
          <span>CAPABILITY MATRIX</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Supported File Types & Formats
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Detailed breakdown of metadata inspection, surgical editing, and lossless sanitization supported directly within your browser.
        </p>
      </div>

      {/* Capabilities Table */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-mono">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#080808]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metadata Support Matrix</h3>
            <p className="text-xs text-zinc-500 font-sans">Live capabilities in MetaRevealX Engine</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-sans">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Supported Now
            </span>
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="w-4 h-4" /> Roadmap / Planned
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#080808] text-zinc-400">
                <th className="py-3.5 px-6 font-semibold uppercase text-[10px] tracking-wider">Format</th>
                <th className="py-3.5 px-4 font-semibold uppercase text-[10px] tracking-wider">Category</th>
                <th className="py-3.5 px-4 font-semibold text-center uppercase text-[10px] tracking-wider">Read Metadata</th>
                <th className="py-3.5 px-4 font-semibold text-center uppercase text-[10px] tracking-wider">Edit Metadata</th>
                <th className="py-3.5 px-4 font-semibold text-center uppercase text-[10px] tracking-wider">Sanitize / Strip</th>
                <th className="py-3.5 px-6 font-semibold text-right uppercase text-[10px] tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {SUPPORTED_FORMATS.map((format, idx) => {
                const isSupported = format.status === 'supported';

                return (
                  <tr key={idx} className="hover:bg-[#0E0E12] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm">{format.extension}</div>
                      <div className="text-[11px] text-zinc-500">{format.name}</div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                        {format.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {format.readMetadata ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400">
                          ✓
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {format.editMetadata === true ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400">
                          ✓
                        </span>
                      ) : format.editMetadata === 'Partial' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px]">
                          Partial
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {format.removeMetadata ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400">
                          ✓
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {isSupported ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          SUPPORTED NOW
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/5 text-zinc-500">
                          COMING SOON
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Format Deep-Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* JPEG Box */}
        <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">JPEG / JPG Photos (Full Support)</h4>
              <span className="text-xs text-emerald-400 font-mono">Full Read, Surgical Edit & Lossless Strip</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            JPEG photos from smartphones and digital cameras encapsulate extensive EXIF and GPS markers. MetaShield provides lossless segment-level stripping (APP1, APP2, APP13, COM) guaranteeing 100% original pixel preservation without recompression loss.
          </p>
          <div className="pt-2 border-t border-white/5">
            <span className="text-[11px] text-zinc-500 block mb-1 font-mono">Common Vulnerabilities:</span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {['GPS Coordinates', 'Altitude', 'Camera Serial S/N', 'Lens Model', 'Capture Time', 'Owner Name'].map((t, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Box */}
        <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">PDF Documents (Full Support)</h4>
              <span className="text-xs text-emerald-400 font-mono">Author & Creator Stream Sanitization</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            PDFs automatically embed the system author name, creation application (e.g. Microsoft Word, Adobe InDesign), producer engine, and creation/modification timestamps in the document info dictionary.
          </p>
          <div className="pt-2 border-t border-white/5">
            <span className="text-[11px] text-zinc-500 block mb-1 font-mono">Common Vulnerabilities:</span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {['Author Account', 'Creation Application', 'PDF Producer', 'Creation Timestamp', 'Keywords'].map((t, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onScanClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold font-mono rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
        >
          <span>Scan a Supported File Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

