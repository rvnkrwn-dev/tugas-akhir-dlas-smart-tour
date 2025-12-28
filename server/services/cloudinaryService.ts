/**
 * Cloudinary Service
 * Handles image uploads, deletion, and management using Cloudinary API
 *
 * Setup:
 * 1. Install: npm install cloudinary
 * 2. Add to .env:
 *    CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 */

import { v2 as cloudinary } from "cloudinary";

// ==================== Types ====================

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  bytes: number;
  folder?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: any;
  resourceType?: "image" | "video" | "raw" | "auto";
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
  publicId?: string;
  overwrite?: boolean;
  tags?: string[];
}

export interface CloudinaryDeleteResult {
  result: "ok" | "not found";
  publicId: string;
}

export interface CloudinaryError {
  message: string;
  code?: string;
  statusCode?: number;
}

// ==================== Configuration ====================

/**
 * Initialize Cloudinary configuration
 */
export function initializeCloudinary(): void {
  const config = useRuntimeConfig();

  if (
    !config.cloudinaryCloudName ||
    !config.cloudinaryApiKey ||
    !config.cloudinaryApiSecret
  ) {
    console.warn(
      "⚠️  Cloudinary credentials not configured. Image uploads will fail.",
    );
    return;
  }

  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    secure: true,
  });

  console.log("✅ Cloudinary initialized successfully");
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  const config = useRuntimeConfig();
  return !!(
    config.cloudinaryCloudName &&
    config.cloudinaryApiKey &&
    config.cloudinaryApiSecret
  );
}

// ==================== Upload Functions ====================

/**
 * Upload image from Buffer
 */
export async function uploadImageFromBuffer(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
  try {
    // Ensure Cloudinary is initialized
    initializeCloudinary();

    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Please set environment variables.",
      );
    }

    // Convert buffer to base64
    const base64String = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    // Default options
    const uploadOptions: any = {
      folder: options.folder || "dlas-smart-tour/attractions",
      resource_type: options.resourceType || "image",
      allowed_formats: options.allowedFormats || [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
      ],
      transformation: options.transformation,
      tags: options.tags || ["attraction"],
    };

    // Add optional fields
    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }
    if (options.overwrite !== undefined) {
      uploadOptions.overwrite = options.overwrite;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      base64String,
      uploadOptions,
    );

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      folder: result.folder,
    };
  } catch (error: any) {
    console.error("Cloudinary upload from buffer error:", error);
    throw new Error(
      `Failed to upload image: ${error.message || "Unknown error"}`,
    );
  }
}

/**
 * Upload image from base64 string
 */
export async function uploadImageFromBase64(
  base64String: string,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
  try {
    // Ensure Cloudinary is initialized
    initializeCloudinary();

    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Please set environment variables.",
      );
    }

    // Validate base64 format
    if (!base64String.startsWith("data:")) {
      throw new Error("Invalid base64 format. Must start with 'data:'");
    }

    // Default options
    const uploadOptions: any = {
      folder: options.folder || "dlas-smart-tour/attractions",
      resource_type: options.resourceType || "image",
      allowed_formats: options.allowedFormats || [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
      ],
      transformation: options.transformation,
      tags: options.tags || ["attraction"],
    };

    // Add optional fields
    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }
    if (options.overwrite !== undefined) {
      uploadOptions.overwrite = options.overwrite;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      base64String,
      uploadOptions,
    );

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      folder: result.folder,
    };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(
      `Failed to upload image: ${error.message || "Unknown error"}`,
    );
  }
}

/**
 * Upload image from URL
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
  try {
    initializeCloudinary();

    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Please set environment variables.",
      );
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      throw new Error("Invalid image URL");
    }

    // Default options
    const uploadOptions: any = {
      folder: options.folder || "dlas-smart-tour/attractions",
      resource_type: options.resourceType || "image",
      allowed_formats: options.allowedFormats || [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
      ],
      transformation: options.transformation,
      tags: options.tags || ["attraction"],
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }
    if (options.overwrite !== undefined) {
      uploadOptions.overwrite = options.overwrite;
    }

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      folder: result.folder,
    };
  } catch (error: any) {
    console.error("Cloudinary upload from URL error:", error);
    throw new Error(
      `Failed to upload image from URL: ${error.message || "Unknown error"}`,
    );
  }
}

/**
 * Upload multiple images from Buffer array
 */
export async function uploadMultipleImagesFromBuffers(
  buffers: Buffer[],
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult[]> {
  if (!buffers || buffers.length === 0) {
    throw new Error("No images provided for upload");
  }

  if (buffers.length > 10) {
    throw new Error("Maximum 10 images allowed per upload");
  }

  const uploadPromises = buffers.map((buffer, index) =>
    uploadImageFromBuffer(buffer, {
      ...options,
      publicId: options.publicId ? `${options.publicId}_${index}` : undefined,
    }),
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error: any) {
    console.error("Multiple upload error:", error);
    throw new Error(
      `Failed to upload images: ${error.message || "Unknown error"}`,
    );
  }
}

/**
 * Upload multiple images from base64 array
 */
export async function uploadMultipleImages(
  base64Array: string[],
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult[]> {
  if (!base64Array || base64Array.length === 0) {
    throw new Error("No images provided for upload");
  }

  if (base64Array.length > 10) {
    throw new Error("Maximum 10 images allowed per upload");
  }

  const uploadPromises = base64Array.map((base64, index) =>
    uploadImageFromBase64(base64, {
      ...options,
      publicId: options.publicId ? `${options.publicId}_${index}` : undefined,
    }),
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error: any) {
    console.error("Multiple upload error:", error);
    throw new Error(
      `Failed to upload images: ${error.message || "Unknown error"}`,
    );
  }
}

// ==================== Delete Functions ====================

/**
 * Delete image by public ID
 */
export async function deleteImage(
  publicId: string,
): Promise<CloudinaryDeleteResult> {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Please set environment variables.",
      );
    }

    if (!publicId) {
      throw new Error("Public ID is required");
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return {
      result: result.result as "ok" | "not found",
      publicId,
    };
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    throw new Error(
      `Failed to delete image: ${error.message || "Unknown error"}`,
    );
  }
}

/**
 * Delete multiple images by public IDs
 */
export async function deleteMultipleImages(
  publicIds: string[],
): Promise<CloudinaryDeleteResult[]> {
  if (!publicIds || publicIds.length === 0) {
    throw new Error("No public IDs provided for deletion");
  }

  const deletePromises = publicIds.map((publicId) => deleteImage(publicId));

  try {
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error: any) {
    console.error("Multiple delete error:", error);
    throw new Error(
      `Failed to delete images: ${error.message || "Unknown error"}`,
    );
  }
}

/**
 * Delete images by prefix (folder)
 */
export async function deleteImagesByPrefix(
  prefix: string,
): Promise<{ deleted: number; errors: number }> {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Please set environment variables.",
      );
    }

    const result = await cloudinary.api.delete_resources_by_prefix(prefix);

    return {
      deleted: Object.keys(result.deleted).length,
      errors: Object.keys(result.deleted_counts || {}).length,
    };
  } catch (error: any) {
    console.error("Delete by prefix error:", error);
    throw new Error(
      `Failed to delete images by prefix: ${error.message || "Unknown error"}`,
    );
  }
}

// ==================== Get/Info Functions ====================

/**
 * Get image details by public ID
 */
export async function getImageDetails(publicId: string): Promise<any> {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Please set environment variables.",
      );
    }

    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error: any) {
    console.error("Get image details error:", error);
    throw new Error(
      `Failed to get image details: ${error.message || "Unknown error"}`,
    );
  }
}

/**
 * Get images from a folder
 */
export async function getImagesFromFolder(
  folder: string,
  maxResults: number = 100,
): Promise<any[]> {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary is not configured. Please set environment variables.",
      );
    }

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: maxResults,
    });

    return result.resources;
  } catch (error: any) {
    console.error("Get images from folder error:", error);
    throw new Error(
      `Failed to get images: ${error.message || "Unknown error"}`,
    );
  }
}

// ==================== Helper Functions ====================

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
    const urlParts = cloudinaryUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Get everything after 'upload' (skip version if present)
    const afterUpload = urlParts.slice(uploadIndex + 1);

    // Remove version (v1234567890) if present
    const pathParts = afterUpload[0] && afterUpload[0].startsWith("v")
      ? afterUpload.slice(1)
      : afterUpload;

    // Join and remove file extension
    const publicIdWithExt = pathParts.join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Extract public ID error:", error);
    return null;
  }
}

/**
 * Generate transformation URL
 */
export function generateTransformationUrl(
  publicId: string,
  transformation: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  },
): string {
  try {
    const transformedUrl = cloudinary.url(publicId, {
      ...transformation,
      secure: true,
    });

    return transformedUrl;
  } catch (error: any) {
    console.error("Generate transformation URL error:", error);
    throw new Error(
      `Failed to generate URL: ${error.message || "Unknown error"}`,
    );
  }
}

/**
 * Generate thumbnail URL
 */
export function generateThumbnailUrl(
  publicId: string,
  width: number = 300,
  height: number = 300,
): string {
  return generateTransformationUrl(publicId, {
    width,
    height,
    crop: "fill",
    quality: "auto",
    format: "webp",
  });
}

// ==================== Validation Functions ====================

/**
 * Validate image file size
 */
export function validateFileSize(
  bytes: number,
  maxSizeMB: number = 10,
): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return bytes <= maxBytes;
}

/**
 * Validate image format
 */
export function validateImageFormat(format: string): boolean {
  const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif"];
  return allowedFormats.includes(format.toLowerCase());
}

/**
 * Validate base64 image string
 */
export function validateBase64Image(base64String: string): {
  isValid: boolean;
  error?: string;
  mimeType?: string;
  size?: number;
} {
  try {
    // Check format
    if (!base64String.startsWith("data:")) {
      return { isValid: false, error: "Invalid base64 format" };
    }

    // Extract mime type
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { isValid: false, error: "Invalid base64 structure" };
    }

    const mimeType = matches[1]!;
    const base64Data = matches[2]!;

    // Check if it's an image
    if (!mimeType.startsWith("image/")) {
      return { isValid: false, error: "File is not an image" };
    }

    // Calculate size
    const base64Length = base64Data.length;
    const padding = (base64Data.match(/=/g) || []).length;
    const size = (base64Length * 3) / 4 - padding;

    // Check size (max 10MB)
    if (!validateFileSize(size)) {
      return { isValid: false, error: "File size exceeds 10MB" };
    }

    return { isValid: true, mimeType, size };
  } catch (error) {
    return { isValid: false, error: "Failed to validate base64 image" };
  }
}

// ==================== Export Default ====================

export default {
  // Initialize
  initializeCloudinary,
  isCloudinaryConfigured,

  // Upload
  uploadImageFromBuffer,
  uploadImageFromBase64,
  uploadImageFromUrl,
  uploadMultipleImages,
  uploadMultipleImagesFromBuffers,

  // Delete
  deleteImage,
  deleteMultipleImages,
  deleteImagesByPrefix,

  // Get/Info
  getImageDetails,
  getImagesFromFolder,

  // Helpers
  extractPublicId,
  generateTransformationUrl,
  generateThumbnailUrl,

  // Validation
  validateFileSize,
  validateImageFormat,
  validateBase64Image,
};
