import { PDFDocument } from 'pdf-lib';
import { FileAnalysis, MetadataField } from '../../types';
import { calculatePrivacyRisk } from '../risk/calculateRisk';
import { formatFileSize } from './image';
import { analyzeFilename } from './filenameAnalyzer';

export async function parsePdfMetadata(
  file: File | Blob,
  fileName: string
): Promise<FileAnalysis> {
  const arrayBuffer = await file.arrayBuffer();
  const fileSize = file.size;
  const mimeType = 'application/pdf';

  const metadataFields: MetadataField[] = [];
  const filenameIntel = analyzeFilename(fileName);

  // Basic Info
  metadataFields.push({
    id: 'meta-pdf-name',
    key: 'FileName',
    label: 'File Name',
    value: fileName,
    displayValue: fileName,
    category: 'basic',
    sensitive: filenameIntel.hasLeak,
    editable: false,
    removable: false,
    severity: filenameIntel.hasLeak ? 'high' : undefined,
    description: filenameIntel.hasLeak
      ? `Filename leaks forensic footprint: ${filenameIntel.platform || 'Platform'} and timestamps`
      : 'Original file identifier',
  });

  if (filenameIntel.hasLeak) {
    metadataFields.push({
      id: 'meta-filename-footprint',
      key: 'FilenameFingerprint',
      label: 'Filename Telemetry Footprint',
      value: `${filenameIntel.platform || 'Platform'} (${filenameIntel.formattedDateTime || filenameIntel.extractedDate || 'Timestamp'})`,
      displayValue: `${filenameIntel.platform || 'Source App'}${filenameIntel.formattedDateTime ? ` • ${filenameIntel.formattedDateTime}` : ''}`,
      category: 'basic',
      sensitive: true,
      editable: false,
      removable: true,
      severity: 'high',
      description: filenameIntel.riskDescription,
    });
  }

  metadataFields.push({
    id: 'meta-pdf-size',
    key: 'FileSize',
    label: 'File Size',
    value: fileSize,
    displayValue: formatFileSize(fileSize),
    category: 'basic',
    sensitive: false,
    editable: false,
    removable: false,
  });

  let pageCount = 0;

  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    pageCount = pdfDoc.getPageCount();

    metadataFields.push({
      id: 'meta-pdf-pages',
      key: 'PageCount',
      label: 'Page Count',
      value: pageCount,
      displayValue: `${pageCount} page${pageCount === 1 ? '' : 's'}`,
      category: 'document',
      sensitive: false,
      editable: false,
      removable: false,
    });

    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const creator = pdfDoc.getCreator();
    const producer = pdfDoc.getProducer();
    const keywords = pdfDoc.getKeywords();
    const creationDate = pdfDoc.getCreationDate();
    const modificationDate = pdfDoc.getModificationDate();

    if (title && title.trim()) {
      metadataFields.push({
        id: 'meta-pdf-title',
        key: 'Title',
        label: 'Document Title',
        value: title,
        displayValue: title,
        category: 'document',
        sensitive: false,
        editable: true,
        removable: true,
        description: 'Embedded document title property',
      });
    }

    if (author && author.trim()) {
      metadataFields.push({
        id: 'meta-pdf-author',
        key: 'Author',
        label: 'Document Author',
        value: author,
        displayValue: author,
        category: 'author',
        sensitive: true,
        editable: true,
        removable: true,
        severity: 'high',
        description: 'Account or user name of document author',
      });
    }

    if (subject && subject.trim()) {
      metadataFields.push({
        id: 'meta-pdf-subject',
        key: 'Subject',
        label: 'Document Subject',
        value: subject,
        displayValue: subject,
        category: 'document',
        sensitive: false,
        editable: true,
        removable: true,
      });
    }

    if (creator && creator.trim()) {
      metadataFields.push({
        id: 'meta-pdf-creator',
        key: 'Creator',
        label: 'Creation Application',
        value: creator,
        displayValue: creator,
        category: 'software',
        sensitive: true,
        editable: true,
        removable: true,
        severity: 'low',
        description: 'Application that generated the PDF (e.g. Word, Acrobat)',
      });
    }

    if (producer && producer.trim()) {
      metadataFields.push({
        id: 'meta-pdf-producer',
        key: 'Producer',
        label: 'PDF Producer / Engine',
        value: producer,
        displayValue: producer,
        category: 'software',
        sensitive: true,
        editable: true,
        removable: true,
        severity: 'low',
        description: 'PDF library or print converter engine',
      });
    }

    if (keywords && keywords.trim()) {
      metadataFields.push({
        id: 'meta-pdf-keywords',
        key: 'Keywords',
        label: 'Keywords / Tags',
        value: keywords,
        displayValue: keywords,
        category: 'document',
        sensitive: false,
        editable: true,
        removable: true,
      });
    }

    if (creationDate) {
      metadataFields.push({
        id: 'meta-pdf-createdate',
        key: 'CreationDate',
        label: 'Creation Timestamp',
        value: creationDate.toISOString(),
        displayValue: creationDate.toLocaleString(),
        category: 'datetime',
        sensitive: true,
        editable: true,
        removable: true,
        severity: 'medium',
      });
    }

    if (modificationDate) {
      metadataFields.push({
        id: 'meta-pdf-moddate',
        key: 'ModificationDate',
        label: 'Modification Timestamp',
        value: modificationDate.toISOString(),
        displayValue: modificationDate.toLocaleString(),
        category: 'datetime',
        sensitive: false,
        editable: true,
        removable: true,
      });
    }
  } catch (err) {
    console.warn('PDF parsing encountered an issue:', err);
  }

  const riskResult = calculatePrivacyRisk(metadataFields, filenameIntel);

  return {
    fileName,
    fileType: 'Document (PDF)',
    mimeType,
    fileSize,
    pageCount,
    metadata: metadataFields,
    privacyScore: riskResult.score,
    riskLevel: riskResult.level,
    risks: riskResult.risks,
    recommendations: riskResult.recommendations,
    hasGps: false,
    filenameIntelligence: filenameIntel,
    rawTagsCount: metadataFields.length,
    originalBlob: file,
  };
}
