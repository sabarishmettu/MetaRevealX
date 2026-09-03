import { MetadataField, PrivacyRisk, RiskLevel, FilenameIntelligence } from '../../types';

export interface RiskCalculationResult {
  score: number;
  level: RiskLevel;
  risks: PrivacyRisk[];
  recommendations: string[];
}

export function calculatePrivacyRisk(
  metadata: MetadataField[],
  filenameIntel?: FilenameIntelligence
): RiskCalculationResult {
  const risks: PrivacyRisk[] = [];
  const recommendations: string[] = [];
  let totalScore = 0;

  // 1. Check for GPS Coordinates (+30 to +50 points)
  const gpsFields = metadata.filter((m) => m.category === 'gps');
  const latField = metadata.find((m) => m.key.toLowerCase().includes('latitude'));
  const lonField = metadata.find((m) => m.key.toLowerCase().includes('longitude'));

  if (latField && lonField && latField.value !== null && lonField.value !== null) {
    const hasAltitude = metadata.some((m) => m.key.toLowerCase().includes('altitude') && m.value !== null);
    const hasGpsTime = metadata.some((m) => m.key.toLowerCase().includes('gpstimestamp') || m.key.toLowerCase().includes('gpsdatestamp'));
    
    const gpsScore = hasAltitude || hasGpsTime ? 50 : 35;
    totalScore += gpsScore;

    risks.push({
      id: 'risk-gps',
      title: 'Precise GPS Coordinates Detected',
      description: `Exact geographic location embedded (${latField.displayValue}, ${lonField.displayValue}). Sharing this file publicly reveals where you were when the file was captured.`,
      category: 'Location Privacy',
      severity: 'critical',
      score: gpsScore,
      metadataFields: gpsFields.map((g) => g.key),
      recommendation: 'Strip all GPS and location tags before sharing to protect physical privacy.',
      removable: true,
    });

    recommendations.push('Remove GPS location coordinates to prevent disclosing physical location.');
  }

  // 2. Check for Author, Creator, Artist, Copyright, Owner Name (+20 points)
  const authorFields = metadata.filter(
    (m) =>
      m.category === 'author' ||
      ['artist', 'author', 'creator', 'ownername', 'cameraviewer', 'xpauthor', 'copyright', 'by-line', 'credit'].includes(
        m.key.toLowerCase()
      )
  );

  const activeAuthorFields = authorFields.filter((m) => m.value && String(m.value).trim() !== '');

  if (activeAuthorFields.length > 0) {
    const score = 20;
    totalScore += score;
    const authorNames = activeAuthorFields.map((f) => `${f.label}: "${f.displayValue}"`).join(', ');

    risks.push({
      id: 'risk-author',
      title: 'Author & Owner Identity Exposed',
      description: `Identifiable creator or copyright metadata found (${authorNames}). This links your real name or pseudonym to the file.`,
      category: 'Personal Identity',
      severity: 'high',
      score,
      metadataFields: activeAuthorFields.map((a) => a.key),
      recommendation: 'Clear personal author names and copyright owner details.',
      removable: true,
    });

    recommendations.push('Remove author and copyright metadata to maintain anonymity.');
  }

  // 3. Check for Device Identifiers & Serial Numbers (+15 to +25 points)
  const serialFields = metadata.filter(
    (m) =>
      m.key.toLowerCase().includes('serial') ||
      m.key.toLowerCase().includes('uniqueid') ||
      m.key.toLowerCase().includes('deviceid')
  ).filter((m) => m.value && String(m.value).trim() !== '');

  const deviceModelFields = metadata.filter(
    (m) =>
      m.category === 'camera' &&
      ['make', 'model', 'lensmodel', 'camera', 'lens', 'devicemanufacturer'].includes(m.key.toLowerCase())
  ).filter((m) => m.value && String(m.value).trim() !== '');

  if (serialFields.length > 0) {
    const score = 25;
    totalScore += score;
    risks.push({
      id: 'risk-serial',
      title: 'Hardware Serial Number Detected',
      description: `Unique hardware serial numbers (${serialFields.map((s) => `${s.label}: ${s.displayValue}`).join(', ')}) can be used for persistent cross-platform device tracking and forensic fingerprinting.`,
      category: 'Device Fingerprinting',
      severity: 'critical',
      score,
      metadataFields: serialFields.map((s) => s.key),
      recommendation: 'Erase all hardware serial numbers and body identifiers.',
      removable: true,
    });
    recommendations.push('Erase hardware serial numbers to prevent cross-image device fingerprinting.');
  } else if (deviceModelFields.length > 0) {
    const score = 15;
    totalScore += score;
    const deviceNames = deviceModelFields.map((d) => d.displayValue).join(' ');
    risks.push({
      id: 'risk-device',
      title: 'Device & Hardware Specifications Found',
      description: `Exact device hardware (${deviceNames}) is recorded, revealing your equipment, phone or camera model.`,
      category: 'Device Privacy',
      severity: 'moderate',
      score,
      metadataFields: deviceModelFields.map((d) => d.key),
      recommendation: 'Sanitize device make and model tags.',
      removable: true,
    });
    recommendations.push('Strip camera/phone model information.');
  }

  // 4. Check for Filename Leakage (e.g. WhatsApp Image 2026-07-27 at 7.58.08 AM.jpeg, Screenshots, Telegram, etc.)
  if (filenameIntel && filenameIntel.hasLeak) {
    const fnScore = filenameIntel.riskScore || 15;
    totalScore += fnScore;
    risks.push({
      id: 'risk-filename',
      title: `Filename Discloses ${filenameIntel.platform ? `${filenameIntel.platform} Origin & ` : ''}Timestamp`,
      description: filenameIntel.riskDescription,
      category: 'Timeline Privacy',
      severity: filenameIntel.platform ? 'high' : 'moderate',
      score: fnScore,
      metadataFields: ['FileName', 'FilenameFingerprint'],
      recommendation: `Anonymize the file name to "${filenameIntel.suggestedCleanName}" during sanitization to avoid leaking messaging app and exact timeline.`,
      removable: true,
    });
    recommendations.push(`Anonymize file name to remove ${filenameIntel.platform || 'app'} source footprint and timestamp.`);
  }

  // 5. Check for Date & Time Stamps (+10 to +15 points)
  const dateFields = metadata.filter(
    (m) =>
      m.category === 'datetime' ||
      ['datetimeoriginal', 'createdate', 'modifydate', 'creationdate', 'moddate', 'datetime', 'timecreated'].includes(
        m.key.toLowerCase()
      )
  ).filter((m) => m.value && String(m.value).trim() !== '');

  if (dateFields.length > 0) {
    const score = 10;
    totalScore += score;
    const sampleDate = dateFields[0].displayValue;
    risks.push({
      id: 'risk-datetime',
      title: 'Temporal Timestamps & Creation Dates',
      description: `Precise timestamp metadata found (${sampleDate}). Timestamps establish personal timelines, routines, and capture moments.`,
      category: 'Timeline Privacy',
      severity: 'moderate',
      score,
      metadataFields: dateFields.map((d) => d.key),
      recommendation: 'Strip creation and modification timestamps before distribution.',
      removable: true,
    });
    recommendations.push('Remove embedded date and time stamps.');
  }

  // 6. Check for Software, Editing History & Tool Fingerprints (+5 to +10 points)
  const softwareFields = metadata.filter(
    (m) =>
      m.category === 'software' ||
      ['software', 'processingsoftware', 'history', 'creator', 'producer', 'application'].includes(m.key.toLowerCase())
  ).filter((m) => m.value && String(m.value).trim() !== '');

  if (softwareFields.length > 0) {
    const score = 5;
    totalScore += score;
    const softList = softwareFields.map((s) => s.displayValue).join(', ');
    risks.push({
      id: 'risk-software',
      title: 'Editing Software & Toolchain Traces',
      description: `Software tools detected (${softList}). Discloses internal workflows, editing applications, or operating system environments.`,
      category: 'Software Fingerprinting',
      severity: 'low',
      score,
      metadataFields: softwareFields.map((s) => s.key),
      recommendation: 'Remove software tags and processing metadata.',
      removable: true,
    });
  }

  // 7. Check for Technical / Camera Settings (+5 points)
  const cameraSettingFields = metadata.filter(
    (m) =>
      m.category === 'camera' &&
      ['fnumber', 'exposuretime', 'iso', 'focallength', 'flash', 'meteringmode', 'whitebalance'].includes(
        m.key.toLowerCase()
      )
  );
  if (cameraSettingFields.length >= 3) {
    totalScore += 5;
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Risk Level
  let level: RiskLevel = 'low';
  if (finalScore >= 81) {
    level = 'critical';
  } else if (finalScore >= 61) {
    level = 'high';
  } else if (finalScore >= 41) {
    level = 'elevated';
  } else if (finalScore >= 21) {
    level = 'moderate';
  } else {
    level = 'low';
  }

  if (recommendations.length === 0 && metadata.length > 0) {
    recommendations.push('File contains minor non-sensitive metadata. Cleaning is optional.');
  } else if (metadata.length === 0 && (!filenameIntel || !filenameIntel.hasLeak)) {
    recommendations.push('No hidden metadata was detected in this file. It is clean.');
  }

  return {
    score: finalScore,
    level,
    risks,
    recommendations,
  };
}
