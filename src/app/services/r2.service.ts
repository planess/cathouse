import { createHash, randomUUID } from 'crypto';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { MediaAsset } from '@app/models/media-asset';

import { Singleton } from './singleton';

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per asset

type UploadOptions = {
  folder?: string;
  fileNameBase?: string;
  metadata?: Record<string, string>;
};

export class R2Service extends Singleton {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicBaseUrl?: string;
  private readonly maxFileSizeBytes: number;

  private constructor() {
    super();

    this.endpoint = this.requireEnv('CLOUDFLARE_S3_ENDPOINT');
    const accessKeyId = this.requireEnv('CLOUDFLARE_ACCESS_KEY_ID');
    const secretAccessKey = this.requireEnv('CLOUDFLARE_ACCESS_KEY_ID_SECRET');

    this.bucket = this.requireEnv('CLOUDFLARE_R2_BUCKET');
    this.publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;
    this.maxFileSizeBytes = Number(
      process.env.CLOUDFLARE_R2_MAX_FILE_BYTES ?? DEFAULT_MAX_FILE_SIZE_BYTES,
    );

    this.client = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFiles(
    files: File[],
    options: UploadOptions = {},
  ): Promise<MediaAsset[]> {
    if (files.length === 0) {
      return [];
    }

    const sanitizedFolder = options.folder
      ?.replace(/[^\w/-]+/g, '-')
      .replaceAll(/^-+|-+$/g, '');

    const uploads = files.map(async (file, index) => {
      if (file.size > this.maxFileSizeBytes) {
        throw new Error(
          `File ${file.name} is too large. Max ${this.maxFileSizeBytes} bytes allowed.`,
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const checksum = createHash('sha256').update(buffer).digest('hex');
      const normalizedName = this.normalizeName(file.name);
      const extension = this.getExtension(normalizedName);
      const hasFileNameBase =
        typeof options.fileNameBase === 'string' &&
        options.fileNameBase.trim() !== '';
      const fileName = hasFileNameBase
        ? `${options.fileNameBase}-${Date.now()}-${index + 1}${extension}`
        : `${Date.now()}-${randomUUID()}-${normalizedName}`;
      const key = [sanitizedFolder, fileName].filter(Boolean).join('/');

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentLength: buffer.byteLength,
          ContentType: file.type || 'application/octet-stream',
          Metadata: this.buildMetadata(file.name, checksum, options.metadata),
        }),
      );

      return {
        key,
        url: this.buildPublicUrl(key),
        size: file.size,
        mimeType: file.type,
        originalName: file.name,
        uploadedAt: new Date(),
        checksum,
      } satisfies MediaAsset;
    });

    return Promise.all(uploads);
  }

  private buildPublicUrl(key: string): string {
    if (
      typeof this.publicBaseUrl === 'string' &&
      this.publicBaseUrl.trim() !== ''
    ) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    return `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
  }

  private normalizeName(fileName: string): string {
    return fileName
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/g, '-')
      .replaceAll(/[^\d._a-z-]/g, '')
      .replaceAll(/-+/g, '-');
  }

  private getExtension(fileName: string): string {
    const parts = fileName.split('.');

    if (parts.length < 2) {
      return '';
    }

    const extension = parts.at(-1) ?? '';

    return extension ? `.${extension}` : '';
  }

  private requireEnv(key: string): string {
    const value = process.env[key];

    if (value === undefined || value === null || value.trim() === '') {
      throw new Error(`Missing required env: ${key}`);
    }

    return value;
  }

  private buildMetadata(
    originalName: string,
    checksum: string,
    metadata?: Record<string, string>,
  ): Record<string, string> {
    const safeMetadata: Record<string, string> = {
      originalname: this.sanitizeMetadataValue(originalName) || 'file',
      checksum: this.sanitizeMetadataValue(checksum),
    };

    if (!metadata) {
      return safeMetadata;
    }

    Object.entries(metadata).forEach(([rawKey, rawValue]) => {
      const key = this.sanitizeMetadataKey(rawKey);
      const value = this.sanitizeMetadataValue(rawValue);

      if (key !== '' && value !== '') {
        safeMetadata[key] = value;
      }
    });

    return safeMetadata;
  }

  private sanitizeMetadataKey(key: string): string {
    return key
      .trim()
      .toLowerCase()
        .replaceAll(/[^\da-z-]+/g, '-')
      .replaceAll(/^-+|-+$/g, '');
  }

  private sanitizeMetadataValue(value: string): string {
    return value
      .normalize('NFKD')
      .replaceAll(/[^\u0020-\u007E]+/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim();
  }
}

export const r2Service = R2Service.getInstance<R2Service>();
