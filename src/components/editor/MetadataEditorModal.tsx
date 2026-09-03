import React, { useState } from 'react';
import { X, Save, Trash2, MapPin, User, FileText, Calendar, ShieldCheck, AlertCircle, Tag, Shuffle, RotateCcw } from 'lucide-react';
import { FileAnalysis, MetadataField } from '../../types';
import { CleanActionOptions } from '../../lib/cleaners/metadataCleaner';

interface MetadataEditorModalProps {
  analysis: FileAnalysis;
  isOpen: boolean;
  onClose: () => void;
  onApplyEdits: (options: CleanActionOptions) => void;
}

export const MetadataEditorModal: React.FC<MetadataEditorModalProps> = ({
  analysis,
  isOpen,
  onClose,
  onApplyEdits,
}) => {
  const [authorVal, setAuthorVal] = useState(
    analysis.metadata.find((m) => m.key === 'Artist' || m.key === 'Author')?.value?.toString() || ''
  );
  const [copyrightVal, setCopyrightVal] = useState(
    analysis.metadata.find((m) => m.key === 'Copyright')?.value?.toString() || ''
  );
  const [titleVal, setTitleVal] = useState(
    analysis.metadata.find((m) => m.key === 'ImageDescription' || m.key === 'Title')?.value?.toString() || ''
  );
  
  const [stripGps, setStripGps] = useState(false);
  const [stripAuthor, setStripAuthor] = useState(false);
  const [stripDates, setStripDates] = useState(false);
  const [stripDevice, setStripDevice] = useState(false);

  // Filename anonymization controls
  const ext = analysis.fileName.includes('.') ? analysis.fileName.substring(analysis.fileName.lastIndexOf('.')) : '';
  const [anonymizeName, setAnonymizeName] = useState(!!analysis.filenameIntelligence?.hasLeak);
  const [customFileName, setCustomFileName] = useState(
    analysis.filenameIntelligence?.suggestedCleanName || `sanitized_media${ext}`
  );

  if (!isOpen) return null;

  const handleRandomizeName = () => {
    const randomHash = Math.random().toString(36).substring(2, 8);
    setCustomFileName(`img_${randomHash}${ext}`);
    setAnonymizeName(true);
  };

  const handleReset = () => {
    setAuthorVal(
      analysis.metadata.find((m) => m.key === 'Artist' || m.key === 'Author')?.value?.toString() || ''
    );
    setCopyrightVal(
      analysis.metadata.find((m) => m.key === 'Copyright')?.value?.toString() || ''
    );
    setTitleVal(
      analysis.metadata.find((m) => m.key === 'ImageDescription' || m.key === 'Title')?.value?.toString() || ''
    );
    setStripGps(false);
    setStripAuthor(false);
    setStripDates(false);
    setStripDevice(false);
    setAnonymizeName(!!analysis.filenameIntelligence?.hasLeak);
    setCustomFileName(
      analysis.filenameIntelligence?.suggestedCleanName || `sanitized_media${ext}`
    );
  };

  const handleSave = () => {
    onApplyEdits({
      mode: 'custom',
      removeGps: stripGps,
      removePersonal: stripAuthor,
      removeDates: stripDates,
      removeDevice: stripDevice,
      anonymizeFileName: anonymizeName,
      customFileName: anonymizeName ? customFileName : undefined,
      customEdits: {
        Artist: stripAuthor ? '' : authorVal,
        Author: stripAuthor ? '' : authorVal,
        Copyright: stripAuthor ? '' : copyrightVal,
        ImageDescription: titleVal,
        Title: titleVal,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080808]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Interactive Metadata Editor</h3>
              <p className="text-[11px] text-zinc-400">Surgically customize or strip metadata fields and anonymize file name</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs bg-[#050505]">
          {/* Notice */}
          <div className="p-3.5 bg-[#080808] border border-white/10 rounded-xl text-zinc-300 flex items-start gap-2.5 leading-relaxed font-sans">
            <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>
              Modifying these fields will produce a newly sanitized copy. The original file remains safe in memory without any changes.
            </span>
          </div>

          {/* Section 0: Output Filename & Anonymization */}
          <div className="p-4 bg-[#080808] border border-white/10 rounded-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <Tag className="w-4 h-4 text-amber-500" />
                <span className="text-xs uppercase tracking-wider">Output File Name & Anonymization</span>
              </div>
              <button
                type="button"
                onClick={() => setAnonymizeName(!anonymizeName)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  anonymizeName
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-white/5 text-zinc-400 border border-white/10'
                }`}
              >
                {anonymizeName ? '✓ Anonymization Active' : 'Keep Original Base Name'}
              </button>
            </div>

            {analysis.filenameIntelligence?.hasLeak && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[11px] font-sans flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Original filename contains forensic timeline markers: {analysis.filenameIntelligence.platform || 'Platform'} and timestamps. Anonymization is highly recommended.
                </span>
              </div>
            )}

            {anonymizeName && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Sanitized Output Filename:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomFileName(analysis.filenameIntelligence?.suggestedCleanName || `sanitized_media${ext}`)}
                      className="text-amber-400 hover:underline text-[10px] cursor-pointer"
                    >
                      Preset Safe Name
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleRandomizeName}
                      className="text-amber-400 hover:underline text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Shuffle className="w-3 h-3" /> Random Hash
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121215] border border-white/10 focus:border-amber-500 rounded-lg text-white font-mono text-xs outline-none"
                  placeholder="e.g. sanitized_photo.jpg"
                />
              </div>
            )}
          </div>

          {/* Section 1: Location & Coordinates */}
          <div className="p-4 bg-[#080808] border border-white/10 rounded-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-xs uppercase tracking-wider">Geographic Location Coordinates</span>
              </div>
              {analysis.hasGps && (
                <button
                  type="button"
                  onClick={() => setStripGps(!stripGps)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    stripGps
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {stripGps ? '✓ Will Be Stripped' : 'Strip All GPS Data'}
                </button>
              )}
            </div>

            {analysis.hasGps ? (
              <div className="grid grid-cols-2 gap-3 text-zinc-400">
                <div>
                  <label className="block mb-1 text-[10px] text-zinc-500">Current Latitude</label>
                  <input
                    type="text"
                    disabled
                    value={analysis.gpsData?.latitude.toFixed(6) + '°'}
                    className="w-full px-3 py-1.5 bg-[#121215] border border-white/10 rounded-lg text-white opacity-70"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] text-zinc-500">Current Longitude</label>
                  <input
                    type="text"
                    disabled
                    value={analysis.gpsData?.longitude.toFixed(6) + '°'}
                    className="w-full px-3 py-1.5 bg-[#121215] border border-white/10 rounded-lg text-white opacity-70"
                  />
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 text-[11px]">No GPS coordinates exist in this file.</p>
            )}
          </div>

          {/* Section 2: Author & Identity */}
          <div className="p-4 bg-[#080808] border border-white/10 rounded-xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <User className="w-4 h-4 text-amber-500" />
                <span className="text-xs uppercase tracking-wider">Author & Identity Metadata</span>
              </div>
              <button
                type="button"
                onClick={() => setStripAuthor(!stripAuthor)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  stripAuthor
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {stripAuthor ? '✓ Will Be Erased' : 'Erase Author Fields'}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-[10px] text-zinc-500">Author / Photographer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anonymous / John Doe"
                  value={stripAuthor ? '[Will Be Removed]' : authorVal}
                  disabled={stripAuthor}
                  onChange={(e) => setAuthorVal(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121215] border border-white/10 focus:border-amber-500 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-zinc-500">Copyright Notice</label>
                <input
                  type="text"
                  placeholder="e.g. Public Domain"
                  value={stripAuthor ? '[Will Be Removed]' : copyrightVal}
                  disabled={stripAuthor}
                  onChange={(e) => setCopyrightVal(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121215] border border-white/10 focus:border-amber-500 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-zinc-500">Title / Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Uncaptioned"
                  value={titleVal}
                  onChange={(e) => setTitleVal(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121215] border border-white/10 focus:border-amber-500 rounded-lg text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Timestamps & Device info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div className="p-4 bg-[#080808] border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-white font-bold flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Timestamps</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-sans">Creation & digitize dates</p>
              </div>
              <button
                type="button"
                onClick={() => setStripDates(!stripDates)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold cursor-pointer ${
                  stripDates
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white'
                }`}
              >
                {stripDates ? '✓ Stripping' : 'Strip Dates'}
              </button>
            </div>

            <div className="p-4 bg-[#080808] border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-white font-bold flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Device Serials</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-sans">Body & lens serial numbers</p>
              </div>
              <button
                type="button"
                onClick={() => setStripDevice(!stripDevice)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold cursor-pointer ${
                  stripDevice
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-white/5 text-zinc-400 border border-white/10 hover:text-white'
                }`}
              >
                {stripDevice ? '✓ Stripping' : 'Strip Device'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#080808] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset all modal form inputs to original extracted values"
              className="px-3.5 py-2 text-xs text-zinc-300 hover:text-white bg-[#141416] hover:bg-zinc-800 border border-white/10 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset to Defaults</span>
            </button>
          </div>
          <button
            id="btn-apply-metadata-edits"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Apply Changes & Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
