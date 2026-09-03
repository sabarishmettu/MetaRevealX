import React, { useState } from 'react';
import { Sparkles, Trash2, MapPin, User, Calendar, Smartphone, ShieldCheck, SlidersHorizontal, ArrowRight, AlertTriangle, Tag } from 'lucide-react';
import { CleanActionOptions } from '../../lib/cleaners/metadataCleaner';

interface QuickPrivacyActionsProps {
  onClean: (options: CleanActionOptions) => void;
  onOpenEditor: () => void;
  hasGps: boolean;
  hasAuthor: boolean;
  hasDates: boolean;
  hasDevice: boolean;
  hasFilenameLeak?: boolean;
  suggestedCleanName?: string;
  isProcessing?: boolean;
}

export const QuickPrivacyActions: React.FC<QuickPrivacyActionsProps> = ({
  onClean,
  onOpenEditor,
  hasGps,
  hasAuthor,
  hasDates,
  hasDevice,
  hasFilenameLeak = false,
  suggestedCleanName,
  isProcessing = false,
}) => {
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    options: CleanActionOptions;
  } | null>(null);

  const handleActionClick = (actionName: string, options: CleanActionOptions) => {
    let title = '';
    let description = '';

    switch (actionName) {
      case 'all':
        title = 'Strip All Hidden Metadata & Anonymize Filename?';
        description = 'This will remove all EXIF, GPS, author, camera, and timestamp headers from the generated clean file, and anonymize the output file name to strip messenger/timeline footprints. Your original file remains completely untouched.';
        break;
      case 'gps':
        title = 'Remove GPS Coordinates?';
        description = 'This will wipe latitude, longitude, and elevation tags from the file without touching other metadata.';
        break;
      case 'author':
        title = 'Remove Author & Identity?';
        description = 'This will clear photographer names, copyright strings, and owner accounts.';
        break;
      case 'dates':
        title = 'Remove Timestamps?';
        description = 'This will clear creation, digitization, and modification timestamps.';
        break;
      case 'device':
        title = 'Remove Device Specs & Serials?';
        description = 'This will erase camera body serials, phone model names, and lens profiles.';
        break;
      case 'filename':
        title = 'Anonymize File Name?';
        description = `This will rename the output file to "${suggestedCleanName || 'sanitized_media'}" to eliminate app origin (e.g. WhatsApp) and exact timestamp exposure from the file title.`;
        break;
      default:
        title = 'Apply Metadata Sanitization?';
        description = 'Generate a cleaned copy of the file with selected metadata removed.';
    }

    setConfirmAction({ title, description, options });
  };

  const handleConfirm = () => {
    if (confirmAction) {
      onClean(confirmAction.options);
      setConfirmAction(null);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-[0.15em] font-mono">
            Direct Sanitization Controls
          </h3>
          <p className="text-xs text-zinc-400">
            Execute automated stripping pipelines or open the custom field editor.
          </p>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Non-Destructive • In-Memory Copy</span>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Strip ALL */}
        <button
          id="btn-action-clean-all"
          disabled={isProcessing}
          onClick={() => handleActionClick('all', { mode: 'all', anonymizeFileName: true })}
          className="p-3.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-mono text-xs font-bold flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4" />
            <span>Strip All Metadata & Anonymize Name</span>
          </div>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Anonymize Filename (if leak detected) */}
        {hasFilenameLeak && (
          <button
            id="btn-action-anonymize-name"
            disabled={isProcessing}
            onClick={() => handleActionClick('filename', { mode: 'custom', anonymizeFileName: true })}
            className="p-3 bg-[#080808] hover:bg-[#121215] border border-amber-500/50 hover:border-amber-400 text-white rounded-xl font-mono text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Anonymize Filename</span>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold">Leak Detected</span>
          </button>
        )}

        {/* Remove Location */}
        <button
          id="btn-action-remove-gps"
          disabled={!hasGps || isProcessing}
          onClick={() => handleActionClick('gps', { mode: 'custom', removeGps: true })}
          className="p-3 bg-[#080808] hover:bg-[#121215] border border-white/5 hover:border-red-500/50 text-white rounded-xl font-mono text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" />
            <span>Remove Location</span>
          </div>
          <span className="text-[10px] text-zinc-500">{hasGps ? 'GPS Found' : 'Clean'}</span>
        </button>

        {/* Remove Author */}
        <button
          id="btn-action-remove-author"
          disabled={!hasAuthor || isProcessing}
          onClick={() => handleActionClick('author', { mode: 'custom', removePersonal: true })}
          className="p-3 bg-[#080808] hover:bg-[#121215] border border-white/5 hover:border-amber-500/50 text-white rounded-xl font-mono text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Remove Identity</span>
          </div>
          <span className="text-[10px] text-zinc-500">{hasAuthor ? 'Author Found' : 'Clean'}</span>
        </button>

        {/* Remove Dates */}
        <button
          id="btn-action-remove-dates"
          disabled={!hasDates || isProcessing}
          onClick={() => handleActionClick('dates', { mode: 'custom', removeDates: true })}
          className="p-3 bg-[#080808] hover:bg-[#121215] border border-white/5 hover:border-amber-500/50 text-white rounded-xl font-mono text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Remove Timestamps</span>
          </div>
          <span className="text-[10px] text-zinc-500">{hasDates ? 'Dates Found' : 'Clean'}</span>
        </button>

        {/* Remove Device Info */}
        <button
          id="btn-action-remove-device"
          disabled={!hasDevice || isProcessing}
          onClick={() => handleActionClick('device', { mode: 'custom', removeDevice: true })}
          className="p-3 bg-[#080808] hover:bg-[#121215] border border-white/5 hover:border-zinc-400 text-white rounded-xl font-mono text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-zinc-300" />
            <span>Remove Device & Serials</span>
          </div>
          <span className="text-[10px] text-zinc-500">{hasDevice ? 'HW Found' : 'Clean'}</span>
        </button>

        {/* Custom Editor */}
        <button
          id="btn-action-open-editor"
          disabled={isProcessing}
          onClick={onOpenEditor}
          className="p-3 bg-[#080808] hover:bg-[#121215] border border-white/10 hover:border-amber-500/50 text-white rounded-xl font-mono text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span>Custom Field Editor</span>
          </div>
          <span className="text-[10px] text-zinc-400">Edit & Retain</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h4 className="text-base font-bold text-white font-mono">{confirmAction.title}</h4>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {confirmAction.description}
            </p>

            <div className="p-3 bg-[#080808] border border-white/5 rounded-xl text-[11px] text-zinc-400 font-mono">
              ✓ Output File: <span className="text-amber-400 font-semibold">{suggestedCleanName || 'filename_clean.ext'}</span>
              <br />✓ Original source buffer is preserved 100% untouched.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="btn-modal-cancel"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-modal-confirm-clean"
                onClick={handleConfirm}
                className="px-5 py-2 text-xs font-mono font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                Generate Clean File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
