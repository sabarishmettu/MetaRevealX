export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

export type MetadataCategory = 
  | 'basic'
  | 'image'
  | 'camera'
  | 'gps'
  | 'datetime'
  | 'author'
  | 'software'
  | 'document'
  | 'audio'
  | 'technical';

export interface MetadataField {
  id: string;
  key: string;
  label: string;
  value: string | number | boolean | null;
  displayValue: string;
  category: MetadataCategory;
  sensitive: boolean;
  editable: boolean;
  removable: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  rawTag?: string;
}

export interface PrivacyRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: RiskLevel;
  score: number;
  metadataFields: string[];
  recommendation: string;
  removable: boolean;
}

export interface GpsData {
  latitude: number;
  longitude: number;
  altitude?: number;
  latitudeRef?: string;
  longitudeRef?: string;
  timestamp?: string;
  formattedAddress?: string;
}

export interface FilenameIntelligence {
  hasLeak: boolean;
  platform?: string;
  category?: 'messaging' | 'screenshot' | 'camera' | 'social' | 'custom';
  extractedDate?: string;
  extractedTime?: string;
  formattedDateTime?: string;
  detectedApp?: string;
  suggestedCleanName: string;
  leakTypes: ('platform' | 'timestamp' | 'app_name' | 'device_type')[];
  riskDescription: string;
  riskScore: number;
}

export interface FileAnalysis {
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  lastModified?: number;
  previewUrl?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  pageCount?: number;
  metadata: MetadataField[];
  privacyScore: number;
  riskLevel: RiskLevel;
  risks: PrivacyRisk[];
  recommendations: string[];
  hasGps: boolean;
  gpsData?: GpsData;
  filenameIntelligence?: FilenameIntelligence;
  rawTagsCount: number;
  originalBlob?: Blob;
  originalFile?: File;
}

export interface CleanProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'skipped';
}

export interface CleanResult {
  cleanBlob: Blob;
  cleanFileName: string;
  cleanUrl: string;
  originalFileName?: string;
  isFilenameAnonymized?: boolean;
  originalSize: number;
  cleanSize: number;
  removedFieldsCount: number;
  removedCategories: string[];
  beforeScore: number;
  afterScore: number;
  beforeRiskLevel: RiskLevel;
  afterRiskLevel: RiskLevel;
  timestamp: number;
}

export interface SupportedFormat {
  extension: string;
  mimeType: string;
  name: string;
  category: 'Image' | 'Document' | 'Media';
  readMetadata: boolean;
  editMetadata: boolean | 'Partial';
  removeMetadata: boolean;
  status: 'supported' | 'planned';
  description: string;
  typicalRisks: string[];
}
