import type { InlineFile } from './types/inline-file';

const DATA_URL_IMAGE_PATTERN =
  /(<img\b[^>]*?\bsrc\s*=\s*)(["'])data:(image\/[\d+a-z.-]+);base64,([^"']+)\2/gi;

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tif',
  'image/vnd.microsoft.icon': 'ico',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
};

/**
 * Converts data-URL images in email HTML to Mailgun inline attachments.
 *
 * @param bodyHtml Email HTML containing images inserted by the editor.
 * @returns Rewritten HTML with CID sources and the corresponding inline files.
 */
export function extractDataUrlInlineImages(bodyHtml: string): {
  bodyHtml: string;
  inlineFiles: InlineFile[];
} {
  const inlineFiles: InlineFile[] = [];
  const rewrittenBodyHtml = bodyHtml.replaceAll(
    DATA_URL_IMAGE_PATTERN,
    (
      original,
      sourcePrefix: string,
      quote: string,
      rawContentType: string,
      base64Data: string,
    ) => {
      const contentType = rawContentType.toLowerCase();
      const extension = IMAGE_EXTENSIONS[contentType];

      if (extension === undefined) {
        return original;
      }

      const data = Buffer.from(base64Data, 'base64');

      if (data.length === 0) {
        return original;
      }

      const filename = `inline-image-${inlineFiles.length + 1}.${extension}`;

      inlineFiles.push({
        contentType,
        data,
        filename,
      });

      return `${sourcePrefix}${quote}cid:${filename}${quote}`;
    },
  );

  return {
    bodyHtml: rewrittenBodyHtml,
    inlineFiles,
  };
}
