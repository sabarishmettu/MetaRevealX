import piexif from 'piexifjs';

export interface SampleFilePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  tagsSummary: string;
  riskHint: string;
  createFile: () => Promise<File>;
}

/**
 * Generates an actual in-memory JPEG with embedded EXIF, GPS coordinates, Camera metadata, and Author tags.
 */
function createSyntheticJpeg(options: {
  width?: number;
  height?: number;
  lat: number;
  lon: number;
  alt: number;
  make: string;
  model: string;
  artist: string;
  software: string;
  serial: string;
  dateTime: string;
  description: string;
}): Blob {
  const canvas = document.createElement('canvas');
  canvas.width = options.width || 800;
  canvas.height = options.height || 600;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Draw a nice dark cybersecurity gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.5, '#1E293B');
    grad.addColorStop(1, '#090D16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Shield graphic in center
    ctx.strokeStyle = '#FF1A1A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 20;
    ctx.moveTo(cx, cy - 60);
    ctx.lineTo(cx + 50, cy - 30);
    ctx.lineTo(cx + 40, cy + 40);
    ctx.lineTo(cx, cy + 80);
    ctx.lineTo(cx - 40, cy + 40);
    ctx.lineTo(cx - 50, cy - 30);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 26, 26, 0.15)';
    ctx.fill();

    // Text labels
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('METASHIELD TEST SAMPLE', cx, cy + 130);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px monospace';
    ctx.fillText(`GPS: ${options.lat.toFixed(4)}°, ${options.lon.toFixed(4)}° | Device: ${options.model}`, cx, cy + 160);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

  // Convert decimal coords to EXIF Rational format
  const latDeg = Math.floor(Math.abs(options.lat));
  const latMin = Math.floor((Math.abs(options.lat) - latDeg) * 60);
  const latSec = Math.round(((Math.abs(options.lat) - latDeg) * 60 - latMin) * 60 * 100);

  const lonDeg = Math.floor(Math.abs(options.lon));
  const lonMin = Math.floor((Math.abs(options.lon) - lonDeg) * 60);
  const lonSec = Math.round(((Math.abs(options.lon) - lonDeg) * 60 - lonMin) * 60 * 100);

  const exifObj = {
    '0th': {
      [piexif.ImageIFD.Make]: options.make,
      [piexif.ImageIFD.Model]: options.model,
      [piexif.ImageIFD.Software]: options.software,
      [piexif.ImageIFD.DateTime]: options.dateTime,
      [piexif.ImageIFD.Artist]: options.artist,
      [piexif.ImageIFD.Copyright]: `Copyright (c) 2026 ${options.artist}. All rights reserved.`,
      [piexif.ImageIFD.ImageDescription]: options.description,
    },
    Exif: {
      [piexif.ExifIFD.DateTimeOriginal]: options.dateTime,
      [piexif.ExifIFD.DateTimeDigitized]: options.dateTime,
      [piexif.ExifIFD.BodySerialNumber]: options.serial,
      [piexif.ExifIFD.LensModel]: 'FE 24-70mm F2.8 GM II',
      [piexif.ExifIFD.ISOSpeedRatings]: 400,
      [piexif.ExifIFD.FNumber]: [28, 10], // f/2.8
      [piexif.ExifIFD.ExposureTime]: [1, 500], // 1/500 sec
      [piexif.ExifIFD.FocalLength]: [35, 1], // 35mm
      [piexif.ExifIFD.UserComment]: 'Confidential capture with embedded metadata.',
    },
    GPS: {
      [piexif.GPSIFD.GPSLatitudeRef]: options.lat >= 0 ? 'N' : 'S',
      [piexif.GPSIFD.GPSLatitude]: [
        [latDeg, 1],
        [latMin, 1],
        [latSec, 100],
      ],
      [piexif.GPSIFD.GPSLongitudeRef]: options.lon >= 0 ? 'E' : 'W',
      [piexif.GPSIFD.GPSLongitude]: [
        [lonDeg, 1],
        [lonMin, 1],
        [lonSec, 100],
      ],
      [piexif.GPSIFD.GPSAltitudeRef]: 0,
      [piexif.GPSIFD.GPSAltitude]: [Math.round(options.alt * 10), 10],
      [piexif.GPSIFD.GPSDateStamp]: '2026:08:15',
    },
  };

  const exifBytes = piexif.dump(exifObj);
  const insertedDataUrl = piexif.insert(exifBytes, dataUrl);

  // Convert insertedDataUrl to Blob
  const byteString = atob(insertedDataUrl.split(',')[1]);
  const mimeString = insertedDataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export const SAMPLE_FILES: SampleFilePreset[] = [
  {
    id: 'sample-whatsapp-media',
    name: 'WhatsApp Image 2026-07-27 at 7.58.08 AM.jpeg',
    category: 'WhatsApp Media',
    description: 'Typical instant messenger export file revealing communication platform fingerprint and precise capture timestamp in the file title.',
    badge: 'Filename Fingerprint',
    tagsSummary: 'WhatsApp Platform • Time: 7:58:08 AM • Date: July 27, 2026',
    riskHint: 'Filename Privacy Leak',
    createFile: async () => {
      const blob = createSyntheticJpeg({
        lat: 40.7128,
        lon: -74.006,
        alt: 10.0,
        make: 'Samsung',
        model: 'Galaxy S24 Ultra',
        artist: 'Exported from WhatsApp Chat',
        software: 'WhatsApp v2.26.8.72',
        serial: 'WA-MSG-20260727-891',
        dateTime: '2026:07:27 07:58:08',
        description: 'WhatsApp shared image sample',
      });
      return new File([blob], 'WhatsApp Image 2026-07-27 at 7.58.08 AM.jpeg', { type: 'image/jpeg' });
    },
  },
  {
    id: 'sample-gps-photo',
    name: 'IMG_2026_Highland_Overlook.jpg',
    category: 'JPEG Image',
    description: 'Realistic smartphone photo containing precise GPS coordinates in San Francisco, iPhone 15 Pro hardware tags, and photographer name.',
    badge: 'High Privacy Risk',
    tagsSummary: 'GPS (37.7749° N, -122.4194° W) • iPhone 15 Pro • ISO 64 • Sarah Chen',
    riskHint: '75% Risk Score',
    createFile: async () => {
      const blob = createSyntheticJpeg({
        lat: 37.7749,
        lon: -122.4194,
        alt: 54.2,
        make: 'Apple',
        model: 'iPhone 15 Pro',
        artist: 'Sarah Chen (sarah.chen@example.com)',
        software: 'iOS 18.2 Camera App',
        serial: 'G6TZ899K0MNQ',
        dateTime: '2026:08:14 17:42:19',
        description: 'Overlook portrait with sunset lighting',
      });
      return new File([blob], 'IMG_2026_Highland_Overlook.jpg', { type: 'image/jpeg' });
    },
  },
  {
    id: 'sample-drone-photo',
    name: 'DJI_Mavic_Industrial_Inspection.jpg',
    category: 'JPEG Image',
    description: 'Drone aerial capture containing Tokyo GPS coordinates, barometric altitude (120m), serial number, and Sony sensor exposure tags.',
    badge: 'Critical Privacy Risk',
    tagsSummary: 'GPS (35.6762° N, 139.6503° E) • 120m Altitude • DJI Mavic 3 Pro • S/N 49821-X',
    riskHint: '90% Risk Score',
    createFile: async () => {
      const blob = createSyntheticJpeg({
        lat: 35.6762,
        lon: 139.6503,
        alt: 120.5,
        make: 'DJI',
        model: 'Mavic 3 Pro Cine',
        artist: 'Apex Aerial Surveillance Ltd',
        software: 'DJI Fly v2.4.1',
        serial: 'DJI-MV3P-99281-TOKYO',
        dateTime: '2026:07:22 11:15:02',
        description: 'Industrial facility perimeter scan - Flight #84',
      });
      return new File([blob], 'DJI_Mavic_Industrial_Inspection.jpg', { type: 'image/jpeg' });
    },
  },
  {
    id: 'sample-camera-portrait',
    name: 'DSC_8492_Studio_Portrait.jpg',
    category: 'JPEG Image',
    description: 'Professional DSLR studio photo with Sony Alpha 7R V camera body serial number, Adobe Photoshop 2026 edit history, and copyright claims.',
    badge: 'Elevated Risk',
    tagsSummary: 'Sony ILCE-7RM5 • Photoshop 2026 • Full EXIF Exposure • Alexander Vance',
    riskHint: '55% Risk Score',
    createFile: async () => {
      const blob = createSyntheticJpeg({
        lat: 51.5074,
        lon: -0.1278,
        alt: 15.0,
        make: 'Sony',
        model: 'ILCE-7RM5 (Alpha 7R V)',
        artist: 'Alexander Vance Photography',
        software: 'Adobe Photoshop 27.2 (Macintosh)',
        serial: 'SN-78401924-JP',
        dateTime: '2026:09:01 14:05:30',
        description: 'Client headshot session - Studio A London',
      });
      return new File([blob], 'DSC_8492_Studio_Portrait.jpg', { type: 'image/jpeg' });
    },
  },
];
