import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Check, Edit3, Trash2, Save, X, RotateCcw, Sparkles, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { MetadataField } from '../../types';
import { CleanActionOptions } from '../../lib/cleaners/metadataCleaner';

interface MetadataTableProps {
  metadata: MetadataField[];
  onEditField?: (field: MetadataField) => void;
  onRemoveField?: (fieldId: string) => void;
  onApplyEdits?: (options: CleanActionOptions) => void;
  onOpenEditorModal?: () => void;
  removedFieldIds?: string[];
  isProcessing?: boolean;
}

export const MetadataTable: React.FC<MetadataTableProps> = ({
  metadata,
  onEditField,
  onRemoveField,
  onApplyEdits,
  onOpenEditorModal,
  removedFieldIds = [],
  isProcessing = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Track edited values for each field by field.key or field.id
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  // Track fields marked to be deleted/wiped
  const [markedForDeletion, setMarkedForDeletion] = useState<Record<string, boolean>>({});
  // Track saved state indicator
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Track reset feedback notification
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Synchronize initial state
  useEffect(() => {
    const initialMap: Record<string, string> = {};
    metadata.forEach((item) => {
      initialMap[item.key] = item.displayValue;
    });
    setEditedValues(initialMap);
    setMarkedForDeletion({});
  }, [metadata]);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Fields' },
    { id: 'gps', label: 'GPS / Location' },
    { id: 'camera', label: 'Camera & Device' },
    { id: 'datetime', label: 'Date & Time' },
    { id: 'author', label: 'Author & Rights' },
    { id: 'software', label: 'Software' },
    { id: 'image', label: 'Image Specs' },
    { id: 'basic', label: 'Basic' },
    { id: 'technical', label: 'Technical' },
  ];

  const filteredMetadata = metadata.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const currentVal = editedValues[item.key] ?? item.displayValue;
    const matchesSearch =
      searchQuery === '' ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.displayValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currentVal.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleValueChange = (key: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    // If it was marked for deletion, unmark it when typed into
    if (markedForDeletion[key]) {
      setMarkedForDeletion((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  const handleToggleWipeField = (key: string) => {
    setMarkedForDeletion((prev) => {
      const nextState = !prev[key];
      if (nextState) {
        setEditedValues((valMap) => ({ ...valMap, [key]: '' }));
      }
      return { ...prev, [key]: nextState };
    });
  };

  const handleResetField = (field: MetadataField) => {
    setEditedValues((prev) => ({
      ...prev,
      [field.key]: field.displayValue,
    }));
    setMarkedForDeletion((prev) => ({
      ...prev,
      [field.key]: false,
    }));
    setResetFeedback(`Restored "${field.label}" to original value`);
    setTimeout(() => setResetFeedback(null), 2500);
  };

  // Check how many changes have been made
  const modifiedEntries = metadata.filter((field) => {
    const currentVal = editedValues[field.key] ?? field.displayValue;
    const isWiped = markedForDeletion[field.key];
    return isWiped || currentVal !== field.displayValue;
  });

  const hasModifications = modifiedEntries.length > 0;

  const handleResetAll = () => {
    const initialMap: Record<string, string> = {};
    metadata.forEach((item) => {
      initialMap[item.key] = item.displayValue;
    });
    setEditedValues(initialMap);
    setMarkedForDeletion({});
    setResetFeedback(`All ${modifiedEntries.length} field modifications reverted to original extracted values`);
    setTimeout(() => setResetFeedback(null), 3500);
  };

  const handleSaveAllEdits = () => {
    if (!onApplyEdits) return;

    // Construct customEdits mapping
    const customEdits: Record<string, string> = {};
    let removeGps = false;
    let removePersonal = false;
    let removeDates = false;
    let removeDevice = false;
    let customFileName: string | undefined = undefined;

    metadata.forEach((field) => {
      const key = field.key;
      const isWiped = markedForDeletion[key];
      const val = (editedValues[key] ?? field.displayValue).trim();

      const isFileNameField =
        key.toLowerCase() === 'filename' ||
        key.toLowerCase() === 'originalfilename' ||
        key.toLowerCase() === 'name' ||
        field.label.toLowerCase() === 'file name' ||
        field.id === 'meta-filename' ||
        field.id === 'meta-pdf-name';

      if (isFileNameField) {
        if (!isWiped && val && val !== field.displayValue) {
          customFileName = val;
        }
      }

      if (isWiped) {
        customEdits[key] = '';
        if (field.category === 'gps') removeGps = true;
        if (field.category === 'author') removePersonal = true;
        if (field.category === 'datetime') removeDates = true;
        if (field.category === 'camera') removeDevice = true;
      } else if (val !== field.displayValue) {
        customEdits[key] = val;
      }
    });

    onApplyEdits({
      mode: 'custom',
      removeGps,
      removePersonal,
      removeDates,
      removeDevice,
      customFileName,
      customEdits,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 font-sans space-y-5">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.15em] font-mono flex items-center gap-2">
              <span>Extracted Metadata Headers</span>
              <span className="text-amber-500 font-mono">({metadata.length})</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono font-semibold">
              Interactive In-Place Editor
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Directly edit any extracted value in the text boxes below, wipe specific tags, or reset changes before saving.
          </p>
        </div>

        {/* Action Controls & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56 md:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter headers or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#080808] border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white placeholder-zinc-500 outline-none font-mono transition-colors"
            />
          </div>

          {onOpenEditorModal && (
            <button
              onClick={onOpenEditorModal}
              title="Open full modal editor"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs flex items-center gap-1.5 font-mono cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Advanced</span>
            </button>
          )}
        </div>
      </div>

      {/* Reset Confirmation / Feedback Toast */}
      {resetFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-400 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetFeedback}</span>
          </div>
          <button
            onClick={() => setResetFeedback(null)}
            className="text-zinc-500 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Changes Banner & Master Save / Reset Bar */}
      {hasModifications && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Edit3 className="w-4 h-4 shrink-0 text-amber-500" />
            <div>
              <span className="font-bold text-white">
                {modifiedEntries.length} Pending Header Edit{modifiedEntries.length > 1 ? 's' : ''}
              </span>
              <span className="text-zinc-400 text-[11px] block sm:inline sm:ml-2">
                Unsaved modifications in memory. You can reset anytime or save a clean copy.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Reset All Button */}
            <button
              id="btn-reset-metadata-edits-top"
              type="button"
              onClick={handleResetAll}
              disabled={isProcessing}
              title="Revert all changes and restore original extracted metadata"
              className="px-3.5 py-1.5 bg-[#141416] hover:bg-zinc-800 border border-white/15 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset All ({modifiedEntries.length})</span>
            </button>

            {/* Save & Generate File Button */}
            <button
              id="btn-save-metadata-edits-top"
              type="button"
              onClick={handleSaveAllEdits}
              disabled={isProcessing}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Generate File</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => {
          const count =
            cat.id === 'all'
              ? metadata.length
              : metadata.filter((m) => m.category === cat.id).length;

          if (cat.id !== 'all' && count === 0) return null;

          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-[#080808] text-zinc-400 hover:text-white hover:bg-[#121215] border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black/20 text-black font-mono font-bold' : 'bg-white/5 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Table with Editable Input Textboxes */}
      <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#080808]">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 bg-[#0C0C0F] text-zinc-400">
              <th className="py-3 px-4 font-semibold uppercase text-[10px] tracking-wider w-[26%]">
                Field Tag & Key
              </th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px] tracking-wider w-[14%]">
                Category
              </th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px] tracking-wider w-[44%]">
                Extracted Value (Editable Box)
              </th>
              <th className="py-3 px-4 font-semibold uppercase text-[10px] tracking-wider text-right w-[16%]">
                Actions / Reset
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMetadata.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-500 font-sans">
                  No metadata fields matching your search query.
                </td>
              </tr>
            ) : (
              filteredMetadata.map((field) => {
                const isRemovedFromExternal = removedFieldIds.includes(field.id);
                const isWiped = markedForDeletion[field.key] || isRemovedFromExternal;
                const currentValue = editedValues[field.key] ?? field.displayValue;
                const isModified = !isWiped && currentValue !== field.displayValue;

                return (
                  <tr
                    key={field.id}
                    className={`hover:bg-[#101014] transition-colors ${
                      isWiped ? 'bg-red-950/10' : isModified ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Header Tag / Key */}
                    <td className="py-3 px-4 align-middle">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{field.label}</span>
                        {isModified && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" title="Modified value" />
                        )}
                        {isWiped && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-semibold">
                            WIPED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="text-zinc-400">{field.key}</span>
                        {field.rawKey && field.rawKey !== field.key && (
                          <span className="text-zinc-600">({field.rawKey})</span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 align-middle">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 text-[10px] uppercase">
                        {field.category}
                      </span>
                    </td>

                    {/* Editable Input Box */}
                    <td className="py-2.5 px-4 align-middle">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          id={`input-meta-${field.key}`}
                          value={isWiped ? '' : currentValue}
                          disabled={isWiped || isProcessing}
                          onChange={(e) => handleValueChange(field.key, e.target.value)}
                          placeholder={isWiped ? '[Tag Marked for Removal / Empty]' : 'Value...'}
                          className={`w-full pl-3 pr-8 py-1.5 rounded-lg text-xs font-mono outline-none transition-all ${
                            isWiped
                              ? 'bg-red-950/20 border border-red-500/30 text-red-400 line-through placeholder-red-500/50'
                              : isModified
                              ? 'bg-[#121216] border border-amber-500/60 text-amber-300 focus:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                              : 'bg-[#121215] border border-white/10 text-zinc-200 focus:border-amber-500/60 focus:bg-[#16161a]'
                          }`}
                        />

                        {/* Inline field reset icon inside textbox */}
                        {isModified && !isWiped && (
                          <button
                            type="button"
                            onClick={() => handleResetField(field)}
                            title="Revert this field to original extracted value"
                            className="absolute right-2 text-amber-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {isModified && !isWiped && (
                        <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono">
                          <span>Original:</span>
                          <span className="text-zinc-400 truncate max-w-xs">{field.displayValue}</span>
                        </div>
                      )}
                    </td>

                    {/* Action & Status */}
                    <td className="py-3 px-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-2">
                        {/* Sensitive badge */}
                        {field.sensitive && !isWiped && !isModified && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Sensitive</span>
                          </span>
                        )}

                        {/* Reset individual modified or wiped row */}
                        {(isModified || isWiped) && (
                          <button
                            type="button"
                            id={`btn-reset-row-${field.key}`}
                            onClick={() => handleResetField(field)}
                            title="Reset this row to original extracted value"
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-lg text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span className="hidden md:inline">Reset</span>
                          </button>
                        )}

                        {/* Strip / Wipe Toggle Button */}
                        <button
                          type="button"
                          id={`btn-wipe-${field.key}`}
                          onClick={() => handleToggleWipeField(field.key)}
                          title={isWiped ? 'Restore this field' : 'Wipe / Clear this metadata tag'}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            isWiped
                              ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                              : 'bg-white/5 hover:bg-red-500/10 border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400'
                          }`}
                        >
                          {isWiped ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Instructions & Dual Reset/Save Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-mono text-zinc-500 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Edit values in any field box above. You can reset anytime or save a clean copy client-side.</span>
        </div>

        {hasModifications && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="btn-reset-metadata-footer"
              type="button"
              onClick={handleResetAll}
              disabled={isProcessing}
              title="Reset all modified fields to original values"
              className="px-4 py-2 bg-[#121215] hover:bg-zinc-800 border border-white/15 text-zinc-300 hover:text-white font-semibold font-mono text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset All Edits</span>
            </button>

            <button
              id="btn-save-metadata-footer"
              type="button"
              onClick={handleSaveAllEdits}
              disabled={isProcessing}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save & Download Copy ({modifiedEntries.length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
