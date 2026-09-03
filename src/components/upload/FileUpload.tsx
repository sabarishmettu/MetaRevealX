import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileType, AlertTriangle, ShieldCheck, Lock, ArrowUpRight, Sparkles } from 'lucide-react';
import { SAMPLE_FILES, SampleFilePreset } from '../../lib/sampleFiles';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sample: SampleFilePreset) => void;
  isProcessing?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onSampleSelect,
  isProcessing = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // File size check
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('File exceeds the 100MB limit. Please select a smaller file.');
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file appears to be empty (0 bytes).');
      return;
    }

    // Supported extensions / MIME types
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage(
        'Unsupported file format. MetaShield Version 1 supports JPG, JPEG, PNG, WebP images, and PDF documents.'
      );
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 font-sans">
      {/* Drag and Drop Zone */}
      <div
        id="dropzone-file-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10 scale-[1.01] shadow-[0_0_40px_rgba(245,158,11,0.25)]'
            : 'border-white/10 bg-[#0A0A0A] hover:border-amber-500/40 hover:bg-[#0D0D10]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-input-element"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        {/* Center Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-105 transition-transform">
          <UploadCloud className="w-8 h-8 animate-pulse text-amber-500" />
        </div>

        {/* Main Text */}
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {isDragging ? 'Release to Scan File Binary' : 'Drop File to Inspect Hidden Metadata'}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6">
          Files never leave your device. EXIF, GPS, camera details, and PDF object streams are parsed in browser RAM.
        </p>

        {/* Browse Button */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <FileType className="w-4 h-4" />
          <span>Browse Device Files</span>
        </div>

        {/* Supported badges */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-zinc-500">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Supported Standards:</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
            JPG / JPEG (EXIF)
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
            PNG (tEXt/iTXt)
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
            WebP (VP8X/EXIF)
          </span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
            PDF (Info/XMP)
          </span>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div
          id="upload-error-banner"
          className="p-4 bg-red-950/30 border border-red-500/40 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-shake"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-semibold mb-0.5">Validation Notice</h5>
            <p className="text-xs text-red-300">{errorMessage}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setErrorMessage(null);
            }}
            className="text-xs underline text-red-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Privacy guarantee indicator */}
      <div className="flex items-center justify-between p-3.5 bg-[#080808] border border-white/5 rounded-xl text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          <span>
            <strong className="text-zinc-200">Zero Server Storage:</strong> Parsed via local Web APIs. Your files are never uploaded to any remote server.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Isolated Sandbox
        </span>
      </div>
    </div>
  );
};

