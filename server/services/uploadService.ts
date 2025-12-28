/**
 * Upload Service
 * Handles file uploads (images) for attractions and other entities
 * Supports local storage and can be extended for cloud storage (S3, Cloudinary, etc.)
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import crypto from 'crypto';
import type { H3Event } from 'h3';
import type { UploadedImage, ImageUploadOptions } from '~~/server/types/attraction.types';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

// ==================== Configuration ====================

const UPLOAD_CONFIG = {
  // Base upload directory (relative to project root)
  baseDir: 'public/uploads',

  // Maximum file size (10MB)
  maxFileSize: 10 * 1024 * 1024,

  // Allowed MIME types
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ],

  // Allowed file extensions
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],

  // Folder structure
  folders: {
    attractions: 'attractions',
    users: 'users',
    temp: 'temp',
  },
};

// ==================== Helper Functions ====================

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${randomString}${ext}`;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Get MIME type from extension
 */
function getMimeTypeFromExtension(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Validate file type
 */
function isValidFileType(mimetype: string, filename: string): boolean {
  const ext = getFileExtension(filename);
  return (
    UPLOAD_CONFIG.allowedMimeTypes.includes(mimetype) &&
    UPLOAD_CONFIG.allowedExtensions.includes(ext)
  );
}

/**
 * Validate file size
 */
function isValidFileSize(size: number, maxSize?: number): boolean {
  const limit = maxSize || UPLOAD_CONFIG.maxFileSize;
  return size > 0 && size <= limit;
}

/**
 * Ensure directory exists
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await stat(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Get full upload path
 */
function getUploadPath(folder: string): string {
  return path.join(process.cwd(), UPLOAD_CONFIG.baseDir, folder);
}

/**
 * Get public URL for uploaded file
 */
function getPublicUrl(folder: string, filename: string): string {
  const config = useRuntimeConfig();
  const baseUrl = config.public.appUrl || 'http://localhost:3000';
  return `${baseUrl}/uploads/${folder}/${filename}`;
}

// ==================== Upload Functions ====================

/**
 * Upload single image from base64
 */
export async function uploadImageFromBase64(
  base64Data: string,
  folder: string = UPLOAD_CONFIG.folders.attractions,
  options: ImageUploadOptions = {}
): Promise<UploadedImage> {
  try {
    // Parse base64 data
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 format');
    }

    const mimetype = matches[1];
    const base64Content = matches[2];

    // Generate filename from mimetype
    const ext = mimetype.split('/')[1];
    const filename = generateUniqueFilename(`image.${ext}`);

    // Validate file type
    if (!isValidFileType(mimetype, filename)) {
      throw new Error(`Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`);
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, 'base64');
    const size = buffer.length;

    // Validate file size
    if (!isValidFileSize(size, options.maxSize)) {
      const maxSizeMB = (options.maxSize || UPLOAD_CONFIG.maxFileSize) / (1024 * 1024);
      throw new Error(`File size exceeds limit of ${maxSizeMB}MB`);
    }

    // Ensure upload directory exists
    const uploadDir = getUploadPath(folder);
    await ensureDirectory(uploadDir);

    // Write file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return upload result
    return {
      url: getPublicUrl(folder, filename),
      filename,
      size,
      mimetype,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Upload single image from multipart form data
 */
export async function uploadImageFromForm(
  event: H3Event,
  fieldName: string = 'image',
  folder: string = UPLOAD_CONFIG.folders.attractions,
  options: ImageUploadOptions = {}
): Promise<UploadedImage> {
  try {
    // Read form data
    const formData = await readMultipartFormData(event);

    if (!formData) {
      throw new Error('No form data provided');
    }

    // Find the file field
    const fileField = formData.find(field => field.name === fieldName);

    if (!fileField || !fileField.data) {
      throw new Error(`No file found in field: ${fieldName}`);
    }

    // Get file info
    const filename = fileField.filename || 'upload';
    const mimetype = fileField.type || getMimeTypeFromExtension(getFileExtension(filename));
    const buffer = fileField.data;
    const size = buffer.length;

    // Validate file type
    if (!isValidFileType(mimetype, filename)) {
      throw new Error(`Invalid file type. Allowed types: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`);
    }

    // Validate file size
    if (!isValidFileSize(size, options.maxSize)) {
      const maxSizeMB = (options.maxSize || UPLOAD_CONFIG.maxFileSize) / (1024 * 1024);
      throw new Error(`File size exceeds limit of ${maxSizeMB}MB`);
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(filename);

    // Ensure upload directory exists
    const uploadDir = getUploadPath(folder);
    await ensureDirectory(uploadDir);

    // Write file
    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Return upload result
    return {
      url: getPublicUrl(folder, uniqueFilename),
      filename: uniqueFilename,
      size,
      mimetype,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple images from base64 array
 */
export async function uploadMultipleImagesFromBase64(
  base64Array: string[],
  folder: string = UPLOAD_CONFIG.folders.attractions,
  options: ImageUploadOptions = {}
): Promise<UploadedImage[]> {
  const uploads: UploadedImage[] = [];
  const errors: string[] = [];

  for (let i = 0; i < base64Array.length; i++) {
    try {
      const uploaded = await uploadImageFromBase64(base64Array[i], folder, options);
      uploads.push(uploaded);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Image ${i + 1}: ${errorMessage}`);
    }
  }

  if (errors.length > 0 && uploads.length === 0) {
    throw new Error(`All uploads failed: ${errors.join(', ')}`);
  }

  return uploads;
}

/**
 * Delete uploaded file
 */
export async function deleteUploadedFile(
  folder: string,
  filename: string
): Promise<boolean> {
  try {
    const filePath = path.join(getUploadPath(folder), filename);
    await unlink(filePath);
    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
}

/**
 * Delete multiple uploaded files
 */
export async function deleteUploadedFiles(
  folder: string,
  filenames: string[]
): Promise<{ deleted: string[]; failed: string[] }> {
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const filename of filenames) {
    const success = await deleteUploadedFile(folder, filename);
    if (success) {
      deleted.push(filename);
    } else {
      failed.push(filename);
    }
  }

  return { deleted, failed };
}

/**
 * Extract filename from URL
 */
export function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return path.basename(pathname);
  } catch {
    return null;
  }
}

/**
 * Extract folder from URL
 */
export function extractFolderFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/');
    const uploadsIndex = parts.indexOf('uploads');

    if (uploadsIndex >= 0 && parts.length > uploadsIndex + 1) {
      return parts[uploadsIndex + 1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const ext = getFileExtension(urlObj.pathname);
    return (
      UPLOAD_CONFIG.allowedExtensions.includes(ext) &&
      (urlObj.protocol === 'http:' || urlObj.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

/**
 * Get file info from URL
 */
export async function getFileInfo(url: string): Promise<{
  exists: boolean;
  size?: number;
  mimetype?: string;
} | null> {
  try {
    const filename = extractFilenameFromUrl(url);
    const folder = extractFolderFromUrl(url);

    if (!filename || !folder) {
      return null;
    }

    const filePath = path.join(getUploadPath(folder), filename);
    const stats = await stat(filePath);

    const ext = getFileExtension(filename);
    const mimetype = getMimeTypeFromExtension(ext);

    return {
      exists: true,
      size: stats.size,
      mimetype,
    };
  } catch {
    return { exists: false };
  }
}

// ==================== Cleanup Functions ====================

/**
 * Clean up old files in temp folder (older than 24 hours)
 */
export async function cleanupTempFiles(): Promise<number> {
  try {
    const tempDir = getUploadPath(UPLOAD_CONFIG.folders.temp);
    const files = await fs.promises.readdir(tempDir);

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await stat(filePath);

      if (stats.mtimeMs < oneDayAgo) {
        await unlink(filePath);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Cleanup temp files error:', error);
    return 0;
  }
}

// ==================== Export Configuration ====================

export const uploadConfig = UPLOAD_CONFIG;

export default {
  uploadImageFromBase64,
  uploadImageFromForm,
  uploadMultipleImagesFromBase64,
  deleteUploadedFile,
  deleteUploadedFiles,
  extractFilenameFromUrl,
  extractFolderFromUrl,
  isValidImageUrl,
  getFileInfo,
  cleanupTempFiles,
  config: UPLOAD_CONFIG,
};
