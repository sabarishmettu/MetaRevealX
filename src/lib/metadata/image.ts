import ExifReader from 'exifreader';
import { FileAnalysis, GpsData, MetadataField } from '../../types';
import { calculatePrivacyRisk } from '../risk/calculateRisk';
import { analyzeFilename } from './filenameAnalyzer';

export async function parseImageMetadata(
  file: File | Blob,
  fileName: string
): Promise<FileAnalysis> {
  const arrayBuffer = await file.arrayBuffer();
  const mimeType = file.type || 'image/jpeg';
  const fileSize = file.size;

  let tags: any = {};
  try {
    tags = await ExifReader.load(arrayBuffer, { expanded: true });
  } catch (err) {
    console.warn('ExifReader failed or no EXIF header found:', err);
    tags = {};
  }

  const metadataFields: MetadataField[] = [];
  let gpsData: GpsData | undefined;
  let hasGps = false;

  // Extract Image Dimensions via HTML5 Image object or tags
  let dimensions: { width: number; height: number } | undefined;
  try {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => {
        dimensions = { width: img.naturalWidth, height: img.naturalHeight };
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.src = objectUrl;
    });
  } catch {
    // fallback to tags if available
    if (tags.file?.['Image Width'] && tags.file?.['Image Height']) {
      dimensions = {
        width: Number(tags.file['Image Width'].value),
        height: Number(tags.file['Image Height'].value),
      };
    }
  }

  // 1. Basic File Information & Filename Intelligence
  const filenameIntel = analyzeFilename(fileName);

  metadataFields.push({
    id: 'meta-filename',
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
    id: 'meta-filesize',
    key: 'FileSize',
    label: 'File Size',
    value: fileSize,
    displayValue: formatFileSize(fileSize),
    category: 'basic',
    sensitive: false,
    editable: false,
    removable: false,
    description: 'Total byte size on disk',
  });

  metadataFields.push({
    id: 'meta-mimetype',
    key: 'MimeType',
    label: 'MIME Type',
    value: mimeType,
    displayValue: mimeType,
    category: 'basic',
    sensitive: false,
    editable: false,
    removable: false,
  });

  if (dimensions) {
    metadataFields.push({
      id: 'meta-dimensions',
      key: 'Dimensions',
      label: 'Image Dimensions',
      value: `${dimensions.width} × ${dimensions.height}`,
      displayValue: `${dimensions.width} × ${dimensions.height} px`,
      category: 'image',
      sensitive: false,
      editable: false,
      removable: false,
      description: 'Resolution in pixels',
    });
  }

  // 2. GPS Processing
  if (tags.gps && (tags.gps.Latitude !== undefined || tags.gps.GPSLatitude !== undefined)) {
    let lat = tags.gps.Latitude ?? tags.gps.GPSLatitude?.description ?? tags.gps.GPSLatitude?.value;
    let lon = tags.gps.Longitude ?? tags.gps.GPSLongitude?.description ?? tags.gps.GPSLongitude?.value;
    const alt = tags.gps.Altitude ?? tags.gps.GPSAltitude?.description ?? tags.gps.GPSAltitude?.value;

    if (typeof lat === 'string') lat = parseFloat(lat);
    if (typeof lon === 'string') lon = parseFloat(lon);

    if (typeof lat === 'number' && !isNaN(lat) && typeof lon === 'number' && !isNaN(lon)) {
      hasGps = true;
      const altNum = typeof alt === 'number' ? alt : typeof alt === 'string' ? parseFloat(alt) : undefined;
      
      gpsData = {
        latitude: lat,
        longitude: lon,
        altitude: !isNaN(altNum || NaN) ? altNum : undefined,
        latitudeRef: tags.gps.GPSLatitudeRef?.description || (lat >= 0 ? 'N' : 'S'),
        longitudeRef: tags.gps.GPSLongitudeRef?.description || (lon >= 0 ? 'E' : 'W'),
        timestamp: tags.gps.GPSTimeStamp?.description || tags.gps.GPSDateStamp?.description,
      };

      metadataFields.push({
        id: 'meta-gps-lat',
        key: 'GPSLatitude',
        label: 'GPS Latitude',
        value: lat,
        displayValue: `${lat.toFixed(6)}° (${gpsData.latitudeRef})`,
        category: 'gps',
        sensitive: true,
        editable: true,
        removable: true,
        severity: 'critical',
        description: 'Exact geographic latitude coordinate',
      });

      metadataFields.push({
        id: 'meta-gps-lon',
        key: 'GPSLongitude',
        label: 'GPS Longitude',
        value: lon,
        displayValue: `${lon.toFixed(6)}° (${gpsData.longitudeRef})`,
        category: 'gps',
        sensitive: true,
        editable: true,
        removable: true,
        severity: 'critical',
        description: 'Exact geographic longitude coordinate',
      });

      if (gpsData.altitude !== undefined) {
        metadataFields.push({
          id: 'meta-gps-alt',
          key: 'GPSAltitude',
          label: 'GPS Altitude',
          value: gpsData.altitude,
          displayValue: `${gpsData.altitude} m above sea level`,
          category: 'gps',
          sensitive: true,
          editable: true,
          removable: true,
          severity: 'high',
          description: 'Elevation above sea level',
        });
      }

      if (gpsData.timestamp) {
        metadataFields.push({
          id: 'meta-gps-time',
          key: 'GPSTimeStamp',
          label: 'GPS Satellite Timestamp',
          value: gpsData.timestamp,
          displayValue: String(gpsData.timestamp),
          category: 'gps',
          sensitive: true,
          editable: true,
          removable: true,
          severity: 'high',
          description: 'Atomic satellite lock timestamp',
        });
      }
    }
  }

  // 3. Camera & Device Hardware Tags
  const exifSection = tags.exif || {};
  const tiffSection = tags.tiff || {};
  const xmpSection = tags.xmp || {};
  const iptcSection = tags.iptc || {};

  const make = exifSection.Make?.description || tiffSection.Make?.description;
  const model = exifSection.Model?.description || tiffSection.Model?.description;
  const lens = exifSection.LensModel?.description || exifSection.LensInfo?.description || xmpSection.Lens?.description;
  const serial = exifSection.BodySerialNumber?.description || exifSection.SerialNumber?.description || exifSection.CameraSerialNumber?.description;
  const lensSerial = exifSection.LensSerialNumber?.description;

  if (make) {
    metadataFields.push({
      id: 'meta-cam-make',
      key: 'Make',
      label: 'Device Manufacturer',
      value: make,
      displayValue: make,
      category: 'camera',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'medium',
      description: 'Camera or smartphone hardware manufacturer',
    });
  }

  if (model) {
    metadataFields.push({
      id: 'meta-cam-model',
      key: 'Model',
      label: 'Device Model',
      value: model,
      displayValue: model,
      category: 'camera',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'medium',
      description: 'Specific device or camera model name',
    });
  }

  if (lens) {
    metadataFields.push({
      id: 'meta-cam-lens',
      key: 'LensModel',
      label: 'Lens Specification',
      value: lens,
      displayValue: lens,
      category: 'camera',
      sensitive: false,
      editable: true,
      removable: true,
      description: 'Attached camera lens hardware profile',
    });
  }

  if (serial) {
    metadataFields.push({
      id: 'meta-cam-serial',
      key: 'BodySerialNumber',
      label: 'Hardware Serial Number',
      value: serial,
      displayValue: serial,
      category: 'camera',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'critical',
      description: 'Unique factory hardware serial number',
    });
  }

  if (lensSerial) {
    metadataFields.push({
      id: 'meta-cam-lens-serial',
      key: 'LensSerialNumber',
      label: 'Lens Serial Number',
      value: lensSerial,
      displayValue: lensSerial,
      category: 'camera',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'high',
      description: 'Unique optical lens serial number',
    });
  }

  // Camera Settings
  const iso = exifSection.ISOSpeedRatings?.description || exifSection.ISO?.description;
  const fNumber = exifSection.FNumber?.description || exifSection.ApertureValue?.description;
  const expTime = exifSection.ExposureTime?.description || exifSection.ShutterSpeedValue?.description;
  const focal = exifSection.FocalLength?.description;
  const flash = exifSection.Flash?.description;
  const whiteBalance = exifSection.WhiteBalance?.description;

  if (iso) {
    metadataFields.push({
      id: 'meta-cam-iso',
      key: 'ISOSpeedRatings',
      label: 'ISO Sensitivity',
      value: iso,
      displayValue: `ISO ${iso}`,
      category: 'camera',
      sensitive: false,
      editable: true,
      removable: true,
      description: 'Sensor light sensitivity',
    });
  }

  if (fNumber) {
    metadataFields.push({
      id: 'meta-cam-fnumber',
      key: 'FNumber',
      label: 'Aperture',
      value: fNumber,
      displayValue: `f/${fNumber}`,
      category: 'camera',
      sensitive: false,
      editable: true,
      removable: true,
      description: 'Lens aperture setting',
    });
  }

  if (expTime) {
    metadataFields.push({
      id: 'meta-cam-exposure',
      key: 'ExposureTime',
      label: 'Exposure Time',
      value: expTime,
      displayValue: `${expTime} sec`,
      category: 'camera',
      sensitive: false,
      editable: true,
      removable: true,
      description: 'Shutter exposure duration',
    });
  }

  if (focal) {
    metadataFields.push({
      id: 'meta-cam-focal',
      key: 'FocalLength',
      label: 'Focal Length',
      value: focal,
      displayValue: `${focal} mm`,
      category: 'camera',
      sensitive: false,
      editable: true,
      removable: true,
      description: 'Optical focal distance',
    });
  }

  if (flash) {
    metadataFields.push({
      id: 'meta-cam-flash',
      key: 'Flash',
      label: 'Flash Activity',
      value: flash,
      displayValue: flash,
      category: 'camera',
      sensitive: false,
      editable: true,
      removable: true,
    });
  }

  if (whiteBalance) {
    metadataFields.push({
      id: 'meta-cam-wb',
      key: 'WhiteBalance',
      label: 'White Balance',
      value: whiteBalance,
      displayValue: whiteBalance,
      category: 'camera',
      sensitive: false,
      editable: true,
      removable: true,
    });
  }

  // 4. Date & Time Information
  const dateOriginal = exifSection.DateTimeOriginal?.description;
  const dateDigitized = exifSection.DateTimeDigitized?.description;
  const dateModified = exifSection.DateTime?.description || tiffSection.DateTime?.description;

  if (dateOriginal) {
    metadataFields.push({
      id: 'meta-dt-original',
      key: 'DateTimeOriginal',
      label: 'Date & Time Taken',
      value: dateOriginal,
      displayValue: formatExifDate(dateOriginal),
      category: 'datetime',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'medium',
      description: 'Exact timestamp when the photo was captured',
    });
  }

  if (dateDigitized && dateDigitized !== dateOriginal) {
    metadataFields.push({
      id: 'meta-dt-digitized',
      key: 'DateTimeDigitized',
      label: 'Date Digitized',
      value: dateDigitized,
      displayValue: formatExifDate(dateDigitized),
      category: 'datetime',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'medium',
    });
  }

  if (dateModified) {
    metadataFields.push({
      id: 'meta-dt-modified',
      key: 'DateTime',
      label: 'File Modification Timestamp',
      value: dateModified,
      displayValue: formatExifDate(dateModified),
      category: 'datetime',
      sensitive: false,
      editable: true,
      removable: true,
    });
  }

  // 5. Author, Creator & Copyright Information
  const artist = exifSection.Artist?.description || tiffSection.Artist?.description || iptcSection['By-line']?.description || xmpSection.creator?.description;
  const copyright = exifSection.Copyright?.description || tiffSection.Copyright?.description || iptcSection.Copyright?.description;
  const owner = exifSection.OwnerName?.description || exifSection.CameraOwnerName?.description;
  const imageDesc = exifSection.ImageDescription?.description || tiffSection.ImageDescription?.description || xmpSection.description?.description;

  if (artist) {
    metadataFields.push({
      id: 'meta-author-artist',
      key: 'Artist',
      label: 'Author / Photographer',
      value: artist,
      displayValue: artist,
      category: 'author',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'high',
      description: 'Identifiable photographer or author name',
    });
  }

  if (owner) {
    metadataFields.push({
      id: 'meta-author-owner',
      key: 'OwnerName',
      label: 'Device / Camera Owner',
      value: owner,
      displayValue: owner,
      category: 'author',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'high',
      description: 'Registered equipment owner identity',
    });
  }

  if (copyright) {
    metadataFields.push({
      id: 'meta-author-copyright',
      key: 'Copyright',
      label: 'Copyright Notice',
      value: copyright,
      displayValue: copyright,
      category: 'author',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'medium',
      description: 'Copyright claimant string',
    });
  }

  if (imageDesc) {
    metadataFields.push({
      id: 'meta-author-desc',
      key: 'ImageDescription',
      label: 'Image Description / Caption',
      value: imageDesc,
      displayValue: imageDesc,
      category: 'author',
      sensitive: false,
      editable: true,
      removable: true,
      description: 'Embedded title, caption or prompt',
    });
  }

  // 6. Software & Application Information
  const software = exifSection.Software?.description || tiffSection.Software?.description || xmpSection.CreatorTool?.description;
  const profileName = tags.icc?.['Profile Description']?.description;

  if (software) {
    metadataFields.push({
      id: 'meta-soft-app',
      key: 'Software',
      label: 'Software / Editing Application',
      value: software,
      displayValue: software,
      category: 'software',
      sensitive: true,
      editable: true,
      removable: true,
      severity: 'low',
      description: 'Editing suite or operating system tool used',
    });
  }

  if (profileName) {
    metadataFields.push({
      id: 'meta-soft-icc',
      key: 'ColorProfile',
      label: 'ICC Color Profile',
      value: profileName,
      displayValue: profileName,
      category: 'technical',
      sensitive: false,
      editable: false,
      removable: true,
    });
  }

  // 7. Check for additional PNG or raw text chunks
  if (tags.png) {
    Object.keys(tags.png).forEach((key) => {
      const tagVal = tags.png[key]?.description || tags.png[key]?.value;
      if (tagVal && typeof tagVal === 'string' && !metadataFields.some((m) => m.key === key)) {
        metadataFields.push({
          id: `meta-png-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          key,
          label: `PNG Chunk: ${key}`,
          value: tagVal,
          displayValue: tagVal,
          category: 'technical',
          sensitive: ['author', 'comment', 'description', 'creation time'].some((s) => key.toLowerCase().includes(s)),
          editable: false,
          removable: true,
          severity: 'medium',
        });
      }
    });
  }

  // Calculate privacy risk score & recommendations
  const riskResult = calculatePrivacyRisk(metadataFields, filenameIntel);

  // Generate preview URL for images
  const previewUrl = URL.createObjectURL(file);

  return {
    fileName,
    fileType: 'Image',
    mimeType,
    fileSize,
    previewUrl,
    dimensions,
    metadata: metadataFields,
    privacyScore: riskResult.score,
    riskLevel: riskResult.level,
    risks: riskResult.risks,
    recommendations: riskResult.recommendations,
    hasGps,
    gpsData,
    filenameIntelligence: filenameIntel,
    rawTagsCount: metadataFields.length,
    originalBlob: file,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatExifDate(dateStr: string): string {
  if (!dateStr) return '';
  // EXIF dates are typically formatted as "YYYY:MM:DD HH:MM:SS"
  if (dateStr.match(/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/)) {
    const [d, t] = dateStr.split(' ');
    const formattedD = d.replace(/:/g, '-');
    return `${formattedD} at ${t}`;
  }
  return dateStr;
}
