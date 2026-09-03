import piexif from 'piexifjs';

/**
 * Strips all metadata segments (APP1 EXIF/XMP, APP2, APP13 IPTC, COM) from a JPEG ArrayBuffer
 * without re-encoding pixels, preserving 100% optical quality and byte fidelity.
 */
export function stripJpegMetadataLossless(buffer: ArrayBuffer): Blob {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // Check SOI marker 0xFF 0xD8
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    // Not a valid JPEG, fallback to canvas or return blob
    return new Blob([buffer], { type: 'image/jpeg' });
  }

  const cleanChunks: Uint8Array[] = [];
  cleanChunks.push(new Uint8Array([0xff, 0xd8])); // SOI

  let offset = 2;
  const len = bytes.length;

  while (offset < len) {
    if (bytes[offset] !== 0xff) {
      // Corrupt or reached scan data
      cleanChunks.push(bytes.subarray(offset));
      break;
    }

    const marker = bytes[offset + 1];

    // If SOS (Start of Scan - 0xDA), everything following is image scan data until EOI (0xD9)
    if (marker === 0xda) {
      cleanChunks.push(bytes.subarray(offset));
      break;
    }

    // Standalone markers without length
    if (marker === 0xd9 || marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
      cleanChunks.push(bytes.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }

    // Segment length is next 2 bytes (big endian)
    const segmentLength = view.getUint16(offset + 2, false);
    const segmentEnd = offset + 2 + segmentLength;

    // Markers to strip:
    // 0xE1 (APP1 - EXIF, XMP)
    // 0xE2 (APP2 - ICC, FlashPix)
    // 0xED (APP13 - IPTC / Photoshop)
    // 0xEE (APP14 - Adobe specific)
    // 0xFE (COM - Comments)
    const isMetadataSegment =
      marker === 0xe1 ||
      marker === 0xe2 ||
      marker === 0xed ||
      marker === 0xee ||
      marker === 0xfe;

    if (!isMetadataSegment) {
      cleanChunks.push(bytes.subarray(offset, segmentEnd));
    }

    offset = segmentEnd;
  }

  return new Blob(cleanChunks, { type: 'image/jpeg' });
}

/**
 * Strips ancillary metadata chunks (tEXt, zTXt, iTXt, eXIf, tIME) from a PNG ArrayBuffer
 * completely losslessly.
 */
export function stripPngMetadataLossless(buffer: ArrayBuffer): Blob {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // PNG Header validation
  const pngHeader = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== pngHeader[i]) {
      return new Blob([buffer], { type: 'image/png' });
    }
  }

  const cleanChunks: Uint8Array[] = [];
  cleanChunks.push(bytes.subarray(0, 8)); // Header

  let offset = 8;
  const len = bytes.length;

  const metadataChunkTypes = new Set(['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME', 'pHYs', 'dSIG']);

  while (offset + 8 <= len) {
    const chunkLength = view.getUint32(offset, false);
    const chunkType = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );

    const totalChunkLength = 4 + 4 + chunkLength + 4; // length + type + data + CRC

    if (!metadataChunkTypes.has(chunkType)) {
      cleanChunks.push(bytes.subarray(offset, offset + totalChunkLength));
    }

    offset += totalChunkLength;

    if (chunkType === 'IEND') {
      break;
    }
  }

  return new Blob(cleanChunks, { type: 'image/png' });
}

/**
 * Selective EXIF editing/removal for JPEG using piexifjs
 */
export async function updateJpegExif(
  imageBlob: Blob,
  options: {
    removeGps?: boolean;
    removeDates?: boolean;
    removeDevice?: boolean;
    removeAuthor?: boolean;
    customFields?: Record<string, any>;
  }
): Promise<Blob> {
  const arrayBuffer = await imageBlob.arrayBuffer();
  let binaryStr = '';
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binaryStr += String.fromCharCode(bytes[i]);
  }

  try {
    const exifObj = piexif.load(binaryStr);

    if (options.removeGps) {
      exifObj['GPS'] = {};
    }

    if (options.removeDates) {
      if (exifObj['Exif']) {
        delete exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal];
        delete exifObj['Exif'][piexif.ExifIFD.DateTimeDigitized];
      }
      if (exifObj['0th']) {
        delete exifObj['0th'][piexif.ImageIFD.DateTime];
      }
    }

    if (options.removeDevice) {
      if (exifObj['0th']) {
        delete exifObj['0th'][piexif.ImageIFD.Make];
        delete exifObj['0th'][piexif.ImageIFD.Model];
        delete exifObj['0th'][piexif.ImageIFD.Software];
      }
      if (exifObj['Exif']) {
        delete exifObj['Exif'][piexif.ExifIFD.BodySerialNumber];
        delete exifObj['Exif'][piexif.ExifIFD.LensSerialNumber];
        delete exifObj['Exif'][piexif.ExifIFD.LensModel];
      }
    }

    if (options.removeAuthor) {
      if (exifObj['0th']) {
        delete exifObj['0th'][piexif.ImageIFD.Artist];
        delete exifObj['0th'][piexif.ImageIFD.Copyright];
        delete exifObj['0th'][piexif.ImageIFD.ImageDescription];
      }
      if (exifObj['Exif']) {
        delete exifObj['Exif'][piexif.ExifIFD.UserComment];
      }
    }

    // Apply custom field edits if any
    if (options.customFields) {
      const artistVal = options.customFields.Artist ?? options.customFields.Author ?? options.customFields.Creator;
      if (artistVal !== undefined && exifObj['0th']) {
        exifObj['0th'][piexif.ImageIFD.Artist] = artistVal;
      }

      const copyrightVal = options.customFields.Copyright ?? options.customFields.Rights;
      if (copyrightVal !== undefined && exifObj['0th']) {
        exifObj['0th'][piexif.ImageIFD.Copyright] = copyrightVal;
      }

      const descVal = options.customFields.ImageDescription ?? options.customFields.Description ?? options.customFields.Title;
      if (descVal !== undefined && exifObj['0th']) {
        exifObj['0th'][piexif.ImageIFD.ImageDescription] = descVal;
      }

      const softwareVal = options.customFields.Software ?? options.customFields.CreatorTool ?? options.customFields.Producer;
      if (softwareVal !== undefined && exifObj['0th']) {
        exifObj['0th'][piexif.ImageIFD.Software] = softwareVal;
      }

      const makeVal = options.customFields.Make ?? options.customFields.CameraMake;
      if (makeVal !== undefined && exifObj['0th']) {
        exifObj['0th'][piexif.ImageIFD.Make] = makeVal;
      }

      const modelVal = options.customFields.Model ?? options.customFields.CameraModel;
      if (modelVal !== undefined && exifObj['0th']) {
        exifObj['0th'][piexif.ImageIFD.Model] = modelVal;
      }

      const commentVal = options.customFields.UserComment ?? options.customFields.Comment;
      if (commentVal !== undefined && exifObj['Exif']) {
        exifObj['Exif'][piexif.ExifIFD.UserComment] = commentVal;
      }
    }

    const exifBytes = piexif.dump(exifObj);
    const newBinaryStr = piexif.insert(exifBytes, binaryStr);

    const newBytes = new Uint8Array(newBinaryStr.length);
    for (let i = 0; i < newBinaryStr.length; i++) {
      newBytes[i] = newBinaryStr.charCodeAt(i);
    }

    return new Blob([newBytes.buffer], { type: 'image/jpeg' });
  } catch (e) {
    console.warn('piexifjs partial update fallback:', e);
    // If piexif cannot parse the specific structure, fallback to lossless strip if removing all
    return stripJpegMetadataLossless(arrayBuffer);
  }
}

/**
 * Canvas fallback for sanitizing WebP or other images
 */
export async function sanitizeImageViaCanvas(
  file: File | Blob,
  outputType: string = 'image/jpeg'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        outputType,
        0.98
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for sanitization'));
    };

    img.src = url;
  });
}
