/**
 * Cloudinary Initialization Plugin
 * This plugin runs when the Nitro server starts
 * and initializes the Cloudinary configuration
 */

import { initializeCloudinary } from "~~/server/services/cloudinaryService";

export default defineNitroPlugin((nitroApp) => {
  try {
    initializeCloudinary();
  } catch (error: any) {
    // Cloudinary initialization failed - handled by service
  }
});
