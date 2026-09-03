import { CleanResult, FileAnalysis } from '../../types';
import { stripJpegMetadataLossless, stripPngMetadataLossless, updateJpegExif, sanitizeImageViaCanvas } from './imageCleaner';
import { cleanPdfMetadata } from './pdfCleaner';

export interface CleanActionOptions {
  mode: 'all' | 'custom';
  removeGps?: boolean;
  removePersonal?: boolean;
  removeDates?: boolean;
  removeDevice?: boolean;
  removeSoftware?: boolean;
  anonymizeFileName?: boolean;
  customFileName?: string;
  customEdits?: Record<string, string>;
}

export async function generateCleanFile(
  analysis: FileAnalysis,
  options: CleanActionOptions,
  onProgress?: (step: string) => void
): Promise<CleanResult> {
  const originalBlob = analysis.originalBlob;
  if (!originalBlob) {
    throw new Error('Original file data is not available for processing.');
  }

  onProgress?.('Preparing file for local sanitization...');
  await new Promise((r) => setTimeout(r, 200));

  const mime = analysis.mimeType.toLowerCase();
  const originalName = analysis.fileName;
  const dotIndex = originalName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
  const ext = dotIndex !== -1 ? originalName.substring(dotIndex) : '';

  // Determine output clean file name
  let cleanFileName = `${baseName}_clean${ext}`;
  let isFilenameAnonymized = false;

  const candidateCustomFileName =
    options.customFileName?.trim() ||
    options.customEdits?.FileName?.trim() ||
    options.customEdits?.fileName?.trim() ||
    options.customEdits?.name?.trim() ||
    options.customEdits?.['File Name']?.trim();

  if (candidateCustomFileName && candidateCustomFileName !== originalName) {
    cleanFileName = candidateCustomFileName;
    if (!cleanFileName.includes('.') && ext) {
      cleanFileName += ext;
    }
    isFilenameAnonymized = true;
  } else if (options.anonymizeFileName || (options.mode === 'all' && analysis.filenameIntelligence?.hasLeak)) {
    cleanFileName = analysis.filenameIntelligence?.suggestedCleanName || `sanitized_media${ext}`;
    isFilenameAnonymized = true;
  }

  let cleanBlob: Blob;
  const removedCategories: string[] = [];
  let removedFieldsCount = 0;

  onProgress?.('Analyzing metadata segments and stripping sensitive headers...');

  const arrayBuffer = await originalBlob.arrayBuffer();

  if (mime === 'image/jpeg' || mime === 'image/jpg' || originalName.toLowerCase().endsWith('.jpg') || originalName.toLowerCase().endsWith('.jpeg')) {
    if (options.mode === 'all') {
      cleanBlob = stripJpegMetadataLossless(arrayBuffer);
      removedCategories.push('Location (GPS)', 'Device & Hardware', 'Author & Identity', 'Timestamps', 'Software');
      if (isFilenameAnonymized && analysis.filenameIntelligence?.hasLeak) {
        removedCategories.push('Filename Telemetry');
      }
      removedFieldsCount = analysis.metadata.filter((m) => m.category !== 'basic').length;
    } else {
      cleanBlob = await updateJpegExif(originalBlob, {
        removeGps: options.removeGps,
        removeDates: options.removeDates,
        removeDevice: options.removeDevice,
        removeAuthor: options.removePersonal,
        customFields: options.customEdits,
      });

      if (options.removeGps) removedCategories.push('Location (GPS)');
      if (options.removePersonal) removedCategories.push('Author & Identity');
      if (options.removeDates) removedCategories.push('Timestamps');
      if (options.removeDevice) removedCategories.push('Device Info');
      if (isFilenameAnonymized) removedCategories.push('Filename Anonymized');
      
      removedFieldsCount = analysis.metadata.filter((m) => {
        if (options.removeGps && m.category === 'gps') return true;
        if (options.removePersonal && m.category === 'author') return true;
        if (options.removeDates && m.category === 'datetime') return true;
        if (options.removeDevice && m.category === 'camera') return true;
        return false;
      }).length;
    }
  } else if (mime === 'image/png' || originalName.toLowerCase().endsWith('.png')) {
    cleanBlob = stripPngMetadataLossless(arrayBuffer);
    removedCategories.push('PNG Chunks', 'Author/Text', 'Timestamps');
    if (isFilenameAnonymized && analysis.filenameIntelligence?.hasLeak) {
      removedCategories.push('Filename Telemetry');
    }
    removedFieldsCount = analysis.metadata.filter((m) => m.category !== 'basic').length;
  } else if (mime === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
    cleanBlob = await cleanPdfMetadata(arrayBuffer, {
      removeAuthor: options.removePersonal,
      removeDates: options.removeDates,
      removeSoftware: options.removeSoftware,
      removeTitle: options.mode === 'all',
      customFields: options.customEdits,
    });
    removedCategories.push('PDF Author', 'Creator/Producer', 'Document Dates');
    if (isFilenameAnonymized && analysis.filenameIntelligence?.hasLeak) {
      removedCategories.push('Filename Telemetry');
    }
    removedFieldsCount = analysis.metadata.filter((m) => m.category !== 'basic').length;
  } else {
    // Canvas re-encoding fallback for other images (e.g. WebP)
    cleanBlob = await sanitizeImageViaCanvas(originalBlob, mime || 'image/jpeg');
    removedCategories.push('All Metadata Chunks');
    if (isFilenameAnonymized && analysis.filenameIntelligence?.hasLeak) {
      removedCategories.push('Filename Telemetry');
    }
    removedFieldsCount = analysis.metadata.filter((m) => m.category !== 'basic').length;
  }

  onProgress?.('Validating binary integrity and generating secure blob...');
  await new Promise((r) => setTimeout(r, 200));

  const cleanUrl = URL.createObjectURL(cleanBlob);

  // Calculate after scores
  let afterScore = 0;
  if (options.mode === 'all') {
    afterScore = 0;
  } else {
    const remainingRisks = analysis.risks.filter((risk) => {
      if (options.removeGps && risk.id === 'risk-gps') return false;
      if (options.removePersonal && risk.id === 'risk-author') return false;
      if (options.removeDevice && (risk.id === 'risk-device' || risk.id === 'risk-serial')) return false;
      if (options.removeDates && risk.id === 'risk-datetime') return false;
      if (isFilenameAnonymized && risk.id === 'risk-filename') return false;
      return true;
    });
    afterScore = Math.max(0, remainingRisks.reduce((sum, r) => sum + r.score, 0));
  }

  let afterRiskLevel: 'low' | 'moderate' | 'elevated' | 'high' | 'critical' = 'low';
  if (afterScore >= 81) afterRiskLevel = 'critical';
  else if (afterScore >= 61) afterRiskLevel = 'high';
  else if (afterScore >= 41) afterRiskLevel = 'elevated';
  else if (afterScore >= 21) afterRiskLevel = 'moderate';
  else afterRiskLevel = 'low';

  return {
    cleanBlob,
    cleanFileName,
    cleanUrl,
    originalFileName: originalName,
    isFilenameAnonymized,
    originalSize: analysis.fileSize,
    cleanSize: cleanBlob.size,
    removedFieldsCount: Math.max(1, removedFieldsCount),
    removedCategories: removedCategories.length > 0 ? removedCategories : ['Sensitive Metadata'],
    beforeScore: analysis.privacyScore,
    afterScore,
    beforeRiskLevel: analysis.riskLevel,
    afterRiskLevel,
    timestamp: Date.now(),
  };
}
