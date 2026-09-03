import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  MapPin,
  FileText,
  Lock,
  ArrowRight,
  UploadCloud,
  FileCheck,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Eye,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroVisualizer } from './components/home/HeroVisualizer';
import { SampleFilesSection } from './components/home/SampleFilesSection';
import { FileUpload } from './components/upload/FileUpload';
import { ScanningProgress } from './components/scanner/ScanningProgress';
import { RiskScoreGauge } from './components/analysis/RiskScoreGauge';
import { SensitiveDataList } from './components/analysis/SensitiveDataList';
import { GpsLocationCard } from './components/analysis/GpsLocationCard';
import { MetadataTable } from './components/analysis/MetadataTable';
import { QuickPrivacyActions } from './components/analysis/QuickPrivacyActions';
import { MetadataEditorModal } from './components/editor/MetadataEditorModal';
import { CleanFileReady } from './components/analysis/CleanFileReady';
import { PrivacyReportModal } from './components/analysis/PrivacyReportModal';
import { SupportedFilesPage } from './components/pages/SupportedFilesPage';
import { AboutPage } from './components/pages/AboutPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { parseImageMetadata, formatFileSize } from './lib/metadata/image';
import { parsePdfMetadata } from './lib/metadata/pdf';
import { generateCleanFile, CleanActionOptions } from './lib/cleaners/metadataCleaner';
import { FileAnalysis, CleanResult, RiskLevel } from './types';
import { SampleFilePreset } from './lib/sampleFiles';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'scanner' | 'supported-files' | 'about' | 'privacy'>('home');
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [cleanResult, setCleanResult] = useState<CleanResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleFileSelect = async (file: File) => {
    setPendingFile(file);
    setCleanResult(null);
    setAnalysis(null);
    setIsScanning(true);
    setCurrentView('scanner');
  };

  const handleSampleSelect = async (sample: SampleFilePreset) => {
    const file = await sample.createFile();
    handleFileSelect(file);
  };

  const handleScanAnimationComplete = async () => {
    if (!pendingFile) return;

    try {
      let result: FileAnalysis;
      const name = pendingFile.name.toLowerCase();

      if (name.endsWith('.pdf') || pendingFile.type === 'application/pdf') {
        result = await parsePdfMetadata(pendingFile, pendingFile.name);
      } else {
        result = await parseImageMetadata(pendingFile, pendingFile.name);
      }

      setAnalysis(result);
    } catch (err) {
      console.error('Failed to parse file metadata:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClean = async (options: CleanActionOptions) => {
    if (!analysis) return;
    setIsCleaning(true);

    try {
      const result = await generateCleanFile(analysis, options);
      setCleanResult(result);
    } catch (err) {
      console.error('Cleaning failed:', err);
      alert('An error occurred while generating the clean file.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleRemoveSingleRisk = (riskId: string) => {
    if (!analysis) return;
    if (riskId === 'risk-gps') {
      handleClean({ mode: 'custom', removeGps: true });
    } else if (riskId === 'risk-author') {
      handleClean({ mode: 'custom', removePersonal: true });
    } else if (riskId === 'risk-device' || riskId === 'risk-serial') {
      handleClean({ mode: 'custom', removeDevice: true });
    } else if (riskId === 'risk-datetime') {
      handleClean({ mode: 'custom', removeDates: true });
    } else if (riskId === 'risk-filename') {
      handleClean({ mode: 'custom', anonymizeFileName: true });
    } else {
      handleClean({ mode: 'all' });
    }
  };

  const handleResetScanner = () => {
    setAnalysis(null);
    setCleanResult(null);
    setPendingFile(null);
    setIsScanning(false);
    setCurrentView('scanner');
  };

  // Nav helpers
  const handleNav = (viewId: string) => {
    if (['home', 'scanner', 'supported-files', 'about', 'privacy'].includes(viewId)) {
      setCurrentView(viewId as any);
    }
  };

  const handleScanCta = () => {
    if (analysis) {
      setCurrentView('scanner');
    } else {
      setCurrentView('scanner');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasAuthor = analysis?.metadata.some((m) => m.category === 'author' && Boolean(m.value)) ?? false;
  const hasDates = analysis?.metadata.some((m) => m.category === 'datetime' && Boolean(m.value)) ?? false;
  const hasDevice = analysis?.metadata.some((m) => m.category === 'camera' && Boolean(m.value)) ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#d4d4d8] selection:bg-amber-500/30 selection:text-white">
      {/* Navigation Header */}
      <Navbar currentView={currentView} onNavigate={handleNav} onScanClick={handleScanCta} />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="space-y-24">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 cyber-grid border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left Column: Headline and CTAs */}
                  <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                    {/* Privacy Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 shadow-sm">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Privacy First: 100% In-Browser Local Processing</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                      Your Files May Reveal <br className="hidden sm:inline" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                        More Than You Think.
                      </span>
                    </h1>

                    {/* Supporting Text */}
                    <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
                      Scan your files for hidden metadata, sensitive information, GPS coordinates, device serials, and privacy risks. Review what your files reveal and remove unnecessary data before sharing.
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                      <button
                        id="hero-scan-btn"
                        onClick={() => setCurrentView('scanner')}
                        className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2.5 transition-all cursor-pointer font-mono"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Scan Your File</span>
                      </button>

                      <a
                        href="#how-it-works"
                        className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all font-mono"
                      >
                        <span>Learn How It Works</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Quick Highlights */}
                    <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-500 font-mono">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No Account Required
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No Server File Storage
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Lossless Sanitization
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Hero Visualizer */}
                  <div className="lg:col-span-5">
                    <HeroVisualizer />
                  </div>
                </div>
              </div>
            </section>

            {/* INSTANT SCANNER UPLOAD ZONE ON HOME */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-3 mb-8">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  Instant File Drop
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Drop a file to inspect hidden metadata
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                  Select a photo or PDF to run a real-time privacy threat assessment.
                </p>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                onSampleSelect={handleSampleSelect}
                isProcessing={isScanning}
              />

              {/* Sample Files Drawer */}
              <div className="mt-8">
                <SampleFilesSection onSelectSample={handleSampleSelect} isLoading={isScanning} />
              </div>
            </section>

            {/* 6 MAIN FEATURES SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-3 mb-12">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  DEFENSE CAPABILITIES
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Engineered for Absolute Privacy
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                  Comprehensive toolset to analyze, sanitize, and manage file telemetry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                {/* Feature 1 */}
                <div className="p-6 bg-[#080808] border border-white/10 hover:border-amber-500/40 rounded-2xl space-y-3 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Metadata Scanner</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Discover EXIF, IPTC, XMP, ICC, and chunk metadata stored inside your images and documents with deep byte inspection.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 bg-[#080808] border border-white/10 hover:border-amber-500/40 rounded-2xl space-y-3 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Privacy Risk Detection</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Identify potentially sensitive information, evaluate physical privacy risks, and calculate a transparent 0-100 threat score.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 bg-[#080808] border border-white/10 hover:border-amber-500/40 rounded-2xl space-y-3 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">GPS Detection</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Detect exact latitude, longitude, and elevation coordinates embedded in photos, and preview the physical location on a map.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-6 bg-[#080808] border border-white/10 hover:border-amber-500/40 rounded-2xl space-y-3 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Metadata Editor</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Surgically edit or replace supported metadata fields like Author, Title, and Copyright without touching binary image pixels.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="p-6 bg-[#080808] border border-white/10 hover:border-amber-500/40 rounded-2xl space-y-3 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Privacy Cleaner</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Losslessly strip unnecessary metadata segments and generate a completely sanitized, safe-to-share file copy.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="p-6 bg-[#080808] border border-white/10 hover:border-amber-500/40 rounded-2xl space-y-3 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Local Processing</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your files remain strictly on your device inside browser RAM. Zero server uploads, zero storage, and zero telemetry.
                  </p>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS (4 STEPS) */}
            <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
              <div className="p-8 sm:p-12 bg-[#080808] border border-white/10 rounded-3xl space-y-10 font-sans">
                <div className="text-center space-y-2 max-w-xl mx-auto">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    WORKFLOW
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Four Simple Steps to File Privacy
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
                  {/* Step 1 */}
                  <div className="p-5 bg-[#121215] border border-white/10 rounded-2xl space-y-3 relative">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-xs flex items-center justify-center">
                      01
                    </div>
                    <h3 className="text-sm font-bold text-white">Upload</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Select or drop any supported image or document into the local browser sandbox.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-5 bg-[#121215] border border-white/10 rounded-2xl space-y-3 relative">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-xs flex items-center justify-center">
                      02
                    </div>
                    <h3 className="text-sm font-bold text-white">Scan</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      MetaRevealX instantly parses raw binary headers, EXIF segments, and embedded GPS tags.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-5 bg-[#121215] border border-white/10 rounded-2xl space-y-3 relative">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold text-xs flex items-center justify-center">
                      03
                    </div>
                    <h3 className="text-sm font-bold text-white">Review</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Inspect the calculated privacy threat score, map location, and identified sensitive items.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-5 bg-[#121215] border border-white/10 rounded-2xl space-y-3 relative">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs flex items-center justify-center">
                      04
                    </div>
                    <h3 className="text-sm font-bold text-white">Clean</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Remove metadata and download a sanitized copy without touching your original file.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SCANNER & ANALYSIS DASHBOARD */}
        {currentView === 'scanner' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
            {/* If currently scanning animation */}
            {isScanning && pendingFile && (
              <div className="py-12">
                <ScanningProgress
                  fileName={pendingFile.name}
                  fileSize={pendingFile.size}
                  onComplete={handleScanAnimationComplete}
                />
              </div>
            )}

            {/* If clean result is ready */}
            {!isScanning && cleanResult && (
              <CleanFileReady
                result={cleanResult}
                onReset={handleResetScanner}
                previewUrl={analysis?.previewUrl}
              />
            )}

            {/* If analysis is active and no clean result yet */}
            {!isScanning && !cleanResult && analysis && (
              <div className="space-y-8 animate-fadeIn">
                {/* File Header Bar */}
                <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 font-mono space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {analysis.previewUrl ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-[#121215] flex-shrink-0 relative group">
                          <img
                            src={analysis.previewUrl}
                            alt={analysis.fileName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#121215] border border-white/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                          <FileText className="w-7 h-7" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
                            {analysis.fileName}
                          </h2>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                            {analysis.fileType}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 font-sans">
                          Size: {formatFileSize(analysis.fileSize)} • Type: {analysis.mimeType}
                          {analysis.dimensions && ` • ${analysis.dimensions.width}×${analysis.dimensions.height}px`}
                          {analysis.pageCount ? ` • ${analysis.pageCount} Pages` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        id="btn-scan-different-file"
                        onClick={handleResetScanner}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Scan Another</span>
                      </button>
                      <button
                        id="btn-quick-clean-header"
                        disabled={isCleaning}
                        onClick={() => handleClean({ mode: 'all' })}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Strip All Metadata</span>
                      </button>
                    </div>
                  </div>

                  {/* Filename Fingerprint Notice */}
                  {analysis.filenameIntelligence?.hasLeak && (
                    <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#0D0D10] -mx-2 sm:-mx-3 px-4 py-3 rounded-xl border border-amber-500/20">
                      <div className="flex items-start sm:items-center gap-2.5 text-amber-400">
                        <Tag className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <span className="font-bold text-white">Filename Forensic Trace Detected:</span>{' '}
                          <span className="text-zinc-300">
                            Discloses <span className="text-amber-400 font-semibold">{analysis.filenameIntelligence.platform || 'Platform Origin'}</span>
                            {analysis.filenameIntelligence.formattedDateTime ? ` & capture time (${analysis.filenameIntelligence.formattedDateTime})` : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        id="btn-header-anonymize-filename"
                        onClick={() => handleClean({ mode: 'custom', anonymizeFileName: true })}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Anonymize Filename</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid: Risk Score Gauge + Quick Privacy Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5">
                    <RiskScoreGauge
                      score={analysis.privacyScore}
                      level={analysis.riskLevel}
                      risksCount={analysis.risks.length}
                      onOpenReport={() => setIsReportOpen(true)}
                    />
                  </div>
                  <div className="lg:col-span-7">
                    <QuickPrivacyActions
                      onClean={handleClean}
                      onOpenEditor={() => setIsEditorOpen(true)}
                      hasGps={analysis.hasGps}
                      hasAuthor={hasAuthor}
                      hasDates={hasDates}
                      hasDevice={hasDevice}
                      hasFilenameLeak={!!analysis.filenameIntelligence?.hasLeak}
                      suggestedCleanName={analysis.filenameIntelligence?.suggestedCleanName}
                      isProcessing={isCleaning}
                    />
                  </div>
                </div>

                {/* Sensitive Data Detected List */}
                <SensitiveDataList
                  risks={analysis.risks}
                  onRemoveRisk={handleRemoveSingleRisk}
                />

                {/* GPS Location Details (if present) */}
                {analysis.hasGps && analysis.gpsData && (
                  <GpsLocationCard
                    gps={analysis.gpsData}
                    onRemoveGps={() => handleClean({ mode: 'custom', removeGps: true })}
                  />
                )}

                {/* Full Metadata Inspector Table with In-Place Editing */}
                <MetadataTable
                  metadata={analysis.metadata}
                  onApplyEdits={handleClean}
                  onOpenEditorModal={() => setIsEditorOpen(true)}
                  isProcessing={isCleaning}
                />
              </div>
            )}

            {/* If no file is loaded yet and not scanning */}
            {!isScanning && !analysis && !cleanResult && (
              <div className="py-6 space-y-8 font-sans">
                <div className="text-center space-y-3 max-w-xl mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-[#080808] border border-white/10 flex items-center justify-center text-amber-500 mx-auto shadow-sm">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    File Privacy & Metadata Scanner
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Select any JPEG, PNG, WebP image or PDF document to begin in-memory scanning.
                  </p>
                </div>

                <FileUpload
                  onFileSelect={handleFileSelect}
                  onSampleSelect={handleSampleSelect}
                  isProcessing={isScanning}
                />

                <SampleFilesSection onSelectSample={handleSampleSelect} isLoading={isScanning} />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SUPPORTED FILES */}
        {currentView === 'supported-files' && (
          <SupportedFilesPage onScanClick={() => setCurrentView('scanner')} />
        )}

        {/* VIEW 4: ABOUT PAGE */}
        {currentView === 'about' && (
          <AboutPage onScanClick={() => setCurrentView('scanner')} />
        )}

        {/* VIEW 5: PRIVACY POLICY PAGE */}
        {currentView === 'privacy' && <PrivacyPolicyPage />}
      </main>

      {/* MODALS */}
      {analysis && isEditorOpen && (
        <MetadataEditorModal
          analysis={analysis}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onApplyEdits={handleClean}
        />
      )}

      {analysis && isReportOpen && (
        <PrivacyReportModal
          analysis={analysis}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={handleNav} />
    </div>
  );
}
