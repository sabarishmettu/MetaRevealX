import { FilenameIntelligence } from '../../types';

export function analyzeFilename(fileName: string): FilenameIntelligence {
  const dotIndex = fileName.lastIndexOf('.');
  const ext = dotIndex !== -1 ? fileName.substring(dotIndex) : '';
  const baseName = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
  const lowerName = fileName.toLowerCase();

  const leakTypes: ('platform' | 'timestamp' | 'app_name' | 'device_type')[] = [];
  let platform: string | undefined;
  let detectedApp: string | undefined;
  let category: 'messaging' | 'screenshot' | 'camera' | 'social' | 'custom' | undefined;
  let extractedDate: string | undefined;
  let extractedTime: string | undefined;
  let formattedDateTime: string | undefined;
  let riskDescription = '';
  let riskScore = 0;
  let suggestedCleanName = `clean_file${ext}`;

  // 1. WhatsApp Patterns
  // Example: "WhatsApp Image 2026-07-27 at 7.58.08 AM.jpeg" or "WhatsApp Video 2026-07-27 at 19.58.08.mp4"
  const waMatch1 = fileName.match(/WhatsApp\s+(Image|Video|Audio|Document|File)\s+(\d{4}-\d{2}-\d{2})\s+at\s+([\d\.]+)(?:\s*(AM|PM))?/i);
  // Example: "IMG-20260727-WA0001.jpg"
  const waMatch2 = fileName.match(/^(?:IMG|VID|DOC|AUD)-(\d{4})(\d{2})(\d{2})-WA(\d+)/i);

  if (waMatch1) {
    platform = 'WhatsApp Messenger';
    detectedApp = 'WhatsApp';
    category = 'messaging';
    leakTypes.push('platform', 'timestamp');
    extractedDate = waMatch1[2]; // e.g. 2026-07-27
    const rawTime = waMatch1[3].replace(/\./g, ':');
    const ampm = waMatch1[4] ? ` ${waMatch1[4].toUpperCase()}` : '';
    extractedTime = `${rawTime}${ampm}`;
    formattedDateTime = formatReadableDateString(extractedDate, extractedTime);
    riskScore = 15;
    riskDescription = `The filename "${fileName}" discloses that the image was exported via WhatsApp Messenger and reveals the exact timestamp (${formattedDateTime}). Messaging platforms often strip EXIF bytes, but the filename retains a forensic timeline fingerprint.`;
    suggestedCleanName = `sanitized_image${ext}`;
  } else if (waMatch2) {
    platform = 'WhatsApp Messenger';
    detectedApp = 'WhatsApp (Android Media Store)';
    category = 'messaging';
    leakTypes.push('platform', 'timestamp');
    extractedDate = `${waMatch2[1]}-${waMatch2[2]}-${waMatch2[3]}`;
    extractedTime = `Sequence #WA${waMatch2[4]}`;
    formattedDateTime = formatReadableDateString(extractedDate, undefined);
    riskScore = 15;
    riskDescription = `The filename "${fileName}" matches WhatsApp's Android storage format (IMG-YYYYMMDD-WAxxxx), revealing the communication platform, capture date (${formattedDateTime}), and sequence number.`;
    suggestedCleanName = `sanitized_image${ext}`;
  } 
  // 2. Telegram Patterns
  // Example: "photo_2026-07-27_07-58-08.jpg" or "Telegram_20260727_075808.jpg"
  else if (lowerName.includes('telegram') || fileName.match(/^photo_(\d{4}-\d{2}-\d{2})_([\d-]+)/i)) {
    const teleMatch = fileName.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})[_at\-]+(\d{2})[-_.]?(\d{2})[-_.]?(\d{2})/i);
    platform = 'Telegram Messenger';
    detectedApp = 'Telegram';
    category = 'messaging';
    leakTypes.push('platform');
    if (teleMatch) {
      leakTypes.push('timestamp');
      extractedDate = `${teleMatch[1]}-${teleMatch[2]}-${teleMatch[3]}`;
      extractedTime = `${teleMatch[4]}:${teleMatch[5]}:${teleMatch[6]}`;
      formattedDateTime = formatReadableDateString(extractedDate, extractedTime);
    }
    riskScore = 15;
    riskDescription = `Filename reveals Telegram application origin${formattedDateTime ? ` and export timestamp (${formattedDateTime})` : ''}.`;
    suggestedCleanName = `sanitized_media${ext}`;
  }
  // 3. Signal Patterns
  // Example: "signal-2026-07-27-075808.jpg"
  else if (lowerName.startsWith('signal-')) {
    const sigMatch = fileName.match(/signal-(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})(\d{2})/i);
    platform = 'Signal Private Messenger';
    detectedApp = 'Signal';
    category = 'messaging';
    leakTypes.push('platform');
    if (sigMatch) {
      leakTypes.push('timestamp');
      extractedDate = `${sigMatch[1]}-${sigMatch[2]}-${sigMatch[3]}`;
      extractedTime = `${sigMatch[4]}:${sigMatch[5]}:${sigMatch[6]}`;
      formattedDateTime = formatReadableDateString(extractedDate, extractedTime);
    }
    riskScore = 15;
    riskDescription = `Filename reveals Signal messenger footprint${formattedDateTime ? ` and exact timestamp (${formattedDateTime})` : ''}.`;
    suggestedCleanName = `sanitized_image${ext}`;
  }
  // 4. Screenshot Patterns (macOS / iOS / Windows / Android)
  // Example: "Screenshot 2026-07-27 at 7.58.08 AM.png" or "Screenshot_20260727-075808_Chrome.jpg"
  else if (lowerName.startsWith('screenshot') || lowerName.startsWith('screen shot')) {
    const screenMatch = fileName.match(/Screen\s*shot[_\s]+(\d{4}[-_]\d{2}[-_]\d{2})(?:[_\s]+at[_\s]+([\d\.]+)(?:\s*(AM|PM))?|[-_]([\d-]+)(?:_([A-Za-z0-9]+))?)?/i);
    platform = 'Screen Capture / Screenshot Tool';
    category = 'screenshot';
    leakTypes.push('platform');

    if (screenMatch) {
      extractedDate = screenMatch[1].replace(/_/g, '-');
      if (screenMatch[2]) {
        const rawTime = screenMatch[2].replace(/\./g, ':');
        const ampm = screenMatch[3] ? ` ${screenMatch[3].toUpperCase()}` : '';
        extractedTime = `${rawTime}${ampm}`;
      } else if (screenMatch[4]) {
        extractedTime = screenMatch[4].replace(/-/g, ':');
      }
      if (screenMatch[5]) {
        detectedApp = screenMatch[5];
        leakTypes.push('app_name');
      }
      if (extractedDate) {
        leakTypes.push('timestamp');
        formattedDateTime = formatReadableDateString(extractedDate, extractedTime);
      }
    }
    riskScore = 12;
    riskDescription = `Filename reveals screen capture activity${detectedApp ? ` from "${detectedApp}"` : ''}${formattedDateTime ? ` at ${formattedDateTime}` : ''}.`;
    suggestedCleanName = `sanitized_screenshot${ext}`;
  }
  // 5. Google Pixel Camera (PXL_YYYYMMDD_HHMMSS...)
  else if (fileName.match(/^PXL_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/i)) {
    const pxlMatch = fileName.match(/^PXL_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/i)!;
    platform = 'Google Pixel Camera';
    detectedApp = 'Google Camera (Pixel)';
    category = 'camera';
    leakTypes.push('device_type', 'timestamp');
    extractedDate = `${pxlMatch[1]}-${pxlMatch[2]}-${pxlMatch[3]}`;
    extractedTime = `${pxlMatch[4]}:${pxlMatch[5]}:${pxlMatch[6]}`;
    formattedDateTime = formatReadableDateString(extractedDate, extractedTime);
    riskScore = 10;
    riskDescription = `Filename matches Google Pixel naming syntax (PXL_...), revealing device brand and capture moment (${formattedDateTime}).`;
    suggestedCleanName = `photo_clean${ext}`;
  }
  // 6. Android / Standard Camera (IMG_YYYYMMDD_HHMMSS...)
  else if (fileName.match(/^(?:IMG|VID)_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/i)) {
    const camMatch = fileName.match(/^(?:IMG|VID)_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/i)!;
    platform = 'Smartphone Camera';
    category = 'camera';
    leakTypes.push('timestamp');
    extractedDate = `${camMatch[1]}-${camMatch[2]}-${camMatch[3]}`;
    extractedTime = `${camMatch[4]}:${camMatch[5]}:${camMatch[6]}`;
    formattedDateTime = formatReadableDateString(extractedDate, extractedTime);
    riskScore = 10;
    riskDescription = `Filename embeds camera capture timestamp (${formattedDateTime}).`;
    suggestedCleanName = `photo_clean${ext}`;
  }
  // 7. Samsung Camera (YYYYMMDD_HHMMSS.jpg)
  else if (fileName.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.(?:jpe?g|png|mp4)$/i)) {
    const samMatch = fileName.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/i)!;
    platform = 'Samsung Galaxy Camera';
    category = 'camera';
    leakTypes.push('device_type', 'timestamp');
    extractedDate = `${samMatch[1]}-${samMatch[2]}-${samMatch[3]}`;
    extractedTime = `${samMatch[4]}:${samMatch[5]}:${samMatch[6]}`;
    formattedDateTime = formatReadableDateString(extractedDate, extractedTime);
    riskScore = 10;
    riskDescription = `Filename matches Samsung camera convention (YYYYMMDD_HHMMSS), revealing capture timestamp (${formattedDateTime}).`;
    suggestedCleanName = `photo_clean${ext}`;
  }
  // 8. Drone (DJI_xxxx.jpg)
  else if (fileName.match(/^DJI_\d+/i)) {
    platform = 'DJI Drone';
    category = 'camera';
    leakTypes.push('device_type');
    riskScore = 8;
    riskDescription = `Filename prefix (DJI_...) confirms aerial drone capture.`;
    suggestedCleanName = `aerial_clean${ext}`;
  }
  // 9. Facebook Image (FB_IMG_xxxx)
  else if (fileName.match(/^FB_IMG_(\d+)/i)) {
    platform = 'Facebook';
    detectedApp = 'Facebook App';
    category = 'social';
    leakTypes.push('platform');
    const fbMatch = fileName.match(/^FB_IMG_(\d+)/i)!;
    const timestampMs = parseInt(fbMatch[1], 10);
    if (!isNaN(timestampMs) && timestampMs > 1000000000000) {
      const d = new Date(timestampMs);
      extractedDate = d.toISOString().split('T')[0];
      extractedTime = d.toTimeString().split(' ')[0];
      formattedDateTime = d.toLocaleString();
      leakTypes.push('timestamp');
    }
    riskScore = 12;
    riskDescription = `Filename discloses Facebook download origin and Unix timestamp.`;
    suggestedCleanName = `sanitized_photo${ext}`;
  }
  // 10. General embedded Date/Time in filename
  else {
    const generalDateMatch = fileName.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
    if (generalDateMatch) {
      extractedDate = `${generalDateMatch[1]}-${generalDateMatch[2]}-${generalDateMatch[3]}`;
      leakTypes.push('timestamp');
      formattedDateTime = formatReadableDateString(extractedDate, undefined);
      riskScore = 5;
      riskDescription = `Filename contains embedded calendar date (${formattedDateTime}).`;
      suggestedCleanName = `${baseName.replace(/\d{4}[-_]\d{2}[-_]\d{2}/g, '').replace(/[-_]+$/g, '') || 'clean_file'}_clean${ext}`;
    }
  }

  const hasLeak = leakTypes.length > 0;

  return {
    hasLeak,
    platform,
    category,
    detectedApp,
    extractedDate,
    extractedTime,
    formattedDateTime,
    leakTypes,
    riskDescription,
    riskScore,
    suggestedCleanName,
  };
}

function formatReadableDateString(dateStr: string, timeStr?: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    const dayNum = parseInt(d, 10);
    const dateFormatted = `${monthName} ${dayNum}, ${y}`;
    if (timeStr) {
      return `${dateFormatted} at ${timeStr}`;
    }
    return dateFormatted;
  } catch {
    return timeStr ? `${dateStr} ${timeStr}` : dateStr;
  }
}
