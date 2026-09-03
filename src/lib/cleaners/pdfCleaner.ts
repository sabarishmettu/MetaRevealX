import { PDFDocument } from 'pdf-lib';

export async function cleanPdfMetadata(
  pdfBuffer: ArrayBuffer,
  options?: {
    removeAuthor?: boolean;
    removeTitle?: boolean;
    removeDates?: boolean;
    removeSoftware?: boolean;
    customFields?: Record<string, string>;
  }
): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  if (!options || Object.keys(options).length === 0) {
    // Strip everything
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');
    pdfDoc.setCreationDate(new Date(0));
    pdfDoc.setModificationDate(new Date(0));
  } else {
    if (options.removeAuthor) pdfDoc.setAuthor('');
    if (options.removeTitle) pdfDoc.setTitle('');
    if (options.removeSoftware) {
      pdfDoc.setCreator('');
      pdfDoc.setProducer('');
    }
    if (options.removeDates) {
      pdfDoc.setCreationDate(new Date(0));
      pdfDoc.setModificationDate(new Date(0));
    }
    if (options.customFields) {
      if (options.customFields.Title !== undefined) pdfDoc.setTitle(options.customFields.Title);
      if (options.customFields.Author !== undefined) pdfDoc.setAuthor(options.customFields.Author);
      if (options.customFields.Subject !== undefined) pdfDoc.setSubject(options.customFields.Subject);
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
