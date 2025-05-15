import type { Core } from '@strapi/strapi';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import os from 'os';
import FormData from 'form-data'; // Node.js FormData implementation

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return {
      data: 'file',
      message: 'Welcome to Strapi 🚀',
    };
  },

  /**
   * Check if a string is a URL
   * @param str - String to check
   * @returns Boolean indicating if the string is a URL
   */
  isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if a URL points to an image
   * @param url - URL to check
   * @returns Boolean indicating if the URL points to an image
   */
  isImageUrl(url: string): boolean {
    if (!this.isUrl(url)) return false;

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const urlPath = new URL(url).pathname.toLowerCase();
    return imageExtensions.some((ext) => urlPath.endsWith(ext));
  },

  /**
   * Download an image from a URL and prepare it for upload to Strapi
   * @param url - Image URL
   * @returns Object with file data ready for upload
   */
  async downloadImage(url: string) {
    try {
      if (!url || typeof url !== 'string') {
        strapi.log.error(`Invalid URL provided to downloadImage: ${url}`);
        return null;
      }

      strapi.log.info(`Attempting to download image from ${url}`);

      // Try to validate the URL
      let validatedUrl;
      try {
        validatedUrl = new URL(url);
      } catch (error) {
        strapi.log.error(`Invalid URL format: ${url}`);
        return null;
      }

      // Download the image as a buffer
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000, // 15 seconds timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB max size
        validateStatus: (status) => status === 200, // Only accept 200 responses
      });

      // Validate that we got some data
      if (!response.data || response.data.length === 0) {
        strapi.log.error(`Empty response received from ${url}`);
        return null;
      }

      // Create buffer from response data
      const data = Buffer.from(response.data);
      if (data.length === 0) {
        strapi.log.error(`Empty buffer created from ${url}`);
        return null;
      }

      // Generate a unique filename
      const urlPath = validatedUrl.pathname;
      const extension = path.extname(urlPath) || '.jpg'; // Default to .jpg if no extension
      const filename = `${uuidv4()}${extension}`;

      // Determine MIME type
      const mimeType = mime.lookup(extension) || 'image/jpeg';

      // Validate content type if available
      if (
        response.headers['content-type'] &&
        !response.headers['content-type'].startsWith('image/')
      ) {
        strapi.log.error(
          `URL returned non-image content type: ${response.headers['content-type']}`
        );
        return null;
      }

      // Return file data for upload
      return {
        data,
        name: filename,
        type: mimeType,
        size: data.length,
      };
    } catch (error) {
      if (error.response) {
        strapi.log.error(
          `Error downloading image from ${url}: HTTP status ${error.response.status}`
        );
      } else if (error.request) {
        strapi.log.error(`Error downloading image from ${url}: No response received`);
      } else {
        strapi.log.error(`Error downloading image from ${url}: ${error.message}`);
      }
      return null;
    }
  },

  /**
   * Upload a file to Strapi's media library using direct API call
   * @param fileData - File data object with data buffer
   * @param tmpFilePath - Path to temporary file
   * @returns Uploaded file object
   */
  async uploadViaAPI(fileData, tmpFilePath) {
    try {
      // Create form data for the API request
      const form = new FormData();

      // Append the file to form data
      form.append('files', fs.createReadStream(tmpFilePath));

      // Create headers from form
      const headers = form.getHeaders();

      // If we have a configured API token, use it for authorization
      // This should be created in the Strapi admin and the token ID stored in environment variable
      // STRAPI_UPLOAD_TOKEN or in the Strapi configuration
      let token = '';
      if (process.env.STRAPI_UPLOAD_TOKEN) {
        token = process.env.STRAPI_UPLOAD_TOKEN;
      } else if (strapi.config.get('plugin.import-content-type.uploadToken')) {
        token = strapi.config.get('plugin.import-content-type.uploadToken');
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make a direct HTTP request to the Strapi upload endpoint
      const serverUrl = strapi.config.server.url || 'http://localhost:1337';
      const apiUrl = `${serverUrl}/api/upload`;
      strapi.log.info(`Posting to API URL: ${apiUrl}`);

      const response = await axios.post(apiUrl, form, { headers });

      if (response.data && response.data[0] && response.data[0].id) {
        strapi.log.info(`API upload succeeded with ID ${response.data[0].id}`);
        return response.data[0];
      } else {
        strapi.log.error('API upload response invalid');
        return null;
      }
    } catch (apiError) {
      strapi.log.error(`API upload approach failed: ${apiError.message}`);
      return null;
    }
  },

  /**
   * Upload a file to Strapi's media library
   * @param fileData - File data object with buffer
   * @param name - Optional custom name for the file
   * @returns Uploaded file object
   */
  async uploadFileToStrapiMediaLibrary(fileData, name = null) {
    try {
      // Validate fileData
      if (!fileData || typeof fileData !== 'object') {
        strapi.log.error('Invalid fileData provided to uploadFileToStrapiMediaLibrary');
        return null;
      }

      // Validate required properties exist
      if (!fileData.name || !fileData.type) {
        strapi.log.error('Missing required properties in fileData');
        return null;
      }

      // Get upload plugin service
      const uploadService = strapi.plugin('upload').service('upload');
      if (!uploadService) {
        strapi.log.error('Upload service not found');
        return null;
      }

      strapi.log.info(`Uploading file ${fileData.name} to media library`);

      // Prepare file for upload in Strapi 5 format
      // Convert fileData.buffer to data if it exists for backward compatibility
      if (fileData.buffer && !fileData.data) {
        fileData.data = fileData.buffer;
      }

      // Validate data exists
      if (!fileData.data) {
        strapi.log.error('Missing data in fileData');
        return null;
      }

      // Create a temporary file for upload
      let tmpFilePath = null;
      try {
        // Create a temporary file
        const tmpDir = os.tmpdir();
        tmpFilePath = path.join(tmpDir, fileData.name);

        // Write the buffer to a temporary file
        fs.writeFileSync(tmpFilePath, fileData.data);
        strapi.log.info(`Created temporary file at ${tmpFilePath}`);

        // Try to upload using upload service first
        try {
          // Prepare the file object in the format expected by Strapi 5
          const fileToUpload = {
            path: tmpFilePath,
            name: fileData.name,
            type: fileData.type,
            size: fs.statSync(tmpFilePath).size,
          };

          // Upload using Strapi upload service
          const results = await uploadService.upload({
            files: fileToUpload,
            data: {
              fileInfo: {
                alternativeText: name || fileData.name || '',
                caption: name || fileData.name || '',
                name: name || (fileData.name ? fileData.name.replace(/\.[^/.]+$/, '') : ''),
              },
            },
          });

          // Check if upload was successful
          if (results && Array.isArray(results) && results.length > 0 && results[0].id) {
            strapi.log.info(`Successfully uploaded file to media library with ID ${results[0].id}`);
            return results[0];
          } else {
            strapi.log.error('Upload service returned invalid result');
          }
        } catch (uploadError) {
          strapi.log.error(`Error during upload service call: ${uploadError.message}`);
          if (uploadError.stack) {
            strapi.log.error(`Stack trace: ${uploadError.stack}`);
          }
        }

        // If service upload failed, try direct API upload
        return await this.uploadViaAPI(fileData, tmpFilePath);
      } finally {
        // Clean up the temporary file
        if (tmpFilePath && fs.existsSync(tmpFilePath)) {
          try {
            fs.unlinkSync(tmpFilePath);
          } catch (cleanupError) {
            strapi.log.error(`Error cleaning up temp file: ${cleanupError.message}`);
          }
        }
      }
    } catch (error) {
      strapi.log.error(`Error uploading file to Strapi media library: ${error.message}`);
      if (error.stack) {
        strapi.log.error(`Stack trace: ${error.stack}`);
      }
      return null;
    }
  },

  /**
   * Process an object recursively to find image URLs and replace them with media references
   * @param obj - Object to process
   * @returns Processed object with image URLs replaced by media references
   */
  async processObjectForImages(obj: any) {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle array case
    if (Array.isArray(obj)) {
      const results = await Promise.all(obj.map((item) => this.processObjectForImages(item)));
      return results;
    }

    // Make a copy of the object to avoid mutating the original
    const result = { ...obj };

    // Process each property
    for (const [key, value] of Object.entries(result)) {
      // If value is a string and an image URL
      if (typeof value === 'string' && this.isImageUrl(value)) {
        try {
          // Download and upload the image to Strapi
          strapi.log.info(`Processing image URL: ${value}`);
          const fileData = await this.downloadImage(value);

          // If download was successful, try to upload
          if (fileData && fileData.data) {
            const uploadedFile = await this.uploadFileToStrapiMediaLibrary(fileData);
            if (uploadedFile && uploadedFile.id) {
              // Replace the URL with the correct media reference format for Strapi 5
              result[key] = {
                connect: [uploadedFile.id],
              };
              strapi.log.info(`Processed image URL ${value} into media ID ${uploadedFile.id}`);
            } else {
              strapi.log.warn(`Failed to upload image from URL ${value}, keeping original value`);
            }
          } else {
            strapi.log.warn(`Failed to download image from URL ${value}, keeping original value`);
          }
        } catch (error) {
          strapi.log.error(`Error processing image URL ${value}: ${error.message}`);
        }
      }
      // Handle special case for object with url property that might be an image
      else if (value && typeof value === 'object') {
        // Check if the object has a URL property that might be an image
        const objWithUrl = value as {
          url?: string;
          caption?: string;
          alt?: string;
          name?: string;
        };

        if (
          objWithUrl.url &&
          typeof objWithUrl.url === 'string' &&
          this.isImageUrl(objWithUrl.url)
        ) {
          try {
            strapi.log.info(`Processing image URL from object: ${objWithUrl.url}`);
            const fileData = await this.downloadImage(objWithUrl.url);

            // If download was successful, try to upload
            if (fileData && fileData.data) {
              // Use caption from the object if available
              const caption =
                objWithUrl.caption || objWithUrl.alt || objWithUrl.name || fileData.name;
              const uploadedFile = await this.uploadFileToStrapiMediaLibrary(fileData, caption);

              if (uploadedFile && uploadedFile.id) {
                // Replace the object with the media reference using Strapi 5 format
                result[key] = {
                  connect: [uploadedFile.id],
                };
                strapi.log.info(
                  `Processed image object with URL ${objWithUrl.url} into media ID ${uploadedFile.id}`
                );
              } else {
                strapi.log.warn(
                  `Failed to upload image from URL object ${objWithUrl.url}, keeping original value`
                );
              }
            } else {
              strapi.log.warn(
                `Failed to download image from URL object ${objWithUrl.url}, keeping original value`
              );
            }
          } catch (error) {
            strapi.log.error(
              `Error processing image URL object ${objWithUrl.url}: ${error.message}`
            );
          }
        } else {
          // Recursively process nested objects
          result[key] = await this.processObjectForImages(value);
        }
      }
    }

    return result;
  },

  /**
   * Import data into a specified content type
   * @param contentType - The target content type API ID
   * @param data - Array of records to import
   * @returns Object with counts of imported records and any errors
   */
  async importData(contentType: string, data: any[]) {
    if (!contentType || !data || !Array.isArray(data)) {
      throw new Error('Invalid parameters: contentType and data array are required');
    }

    if (!strapi.contentTypes[`api::${contentType}.${contentType}`]) {
      throw new Error(`Content type "${contentType}" not found`);
    }

    const results = {
      contentType,
      totalRecords: data.length,
      successful: 0,
      failed: 0,
      errors: [] as { index: number; message: string }[],
      processedImages: 0,
      skippedImages: 0,
    };

    // Process records in batches to avoid overwhelming the database
    const batchSize = 20; // Reduced batch size for better error handling
    const batches = Math.ceil(data.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      // Process each record in the current batch
      const batchPromises = batch.map(async (record, index) => {
        const recordIndex = start + index;
        try {
          // First check for images and process them
          strapi.log.info(`Processing record ${recordIndex} for images`);
          const processedRecord = await this.processObjectForImages(record);

          // Create the content type entry with processed image references
          strapi.log.info(`Creating content type ${contentType} entry with processed data`);

          // Clean up any failed image references before creating the entry
          const sanitizedRecord = this.sanitizeRecordBeforeCreate(processedRecord);

          await strapi.entityService.create(`api::${contentType}.${contentType}`, {
            data: sanitizedRecord,
          });

          results.successful++;
        } catch (error) {
          strapi.log.error(`Error processing record ${recordIndex}: ${error.message}`);
          results.failed++;
          results.errors.push({
            index: recordIndex,
            message: error.message || 'Unknown error',
          });
        }
      });

      // Wait for all records in the batch to be processed before moving to the next batch
      // Using allSettled to prevent one failure from stopping the entire batch
      await Promise.allSettled(batchPromises);
    }

    return results;
  },

  /**
   * Sanitize a record before creating it to remove any invalid media references
   * @param record - The record to sanitize
   * @returns The sanitized record
   */
  sanitizeRecordBeforeCreate(record: any) {
    if (!record || typeof record !== 'object') return record;

    // Handle array case
    if (Array.isArray(record)) {
      return record.map((item) => this.sanitizeRecordBeforeCreate(item));
    }

    // Make a copy of the record to avoid mutating the original
    const result = { ...record };

    // Check each property
    for (const [key, value] of Object.entries(result)) {
      // Check for invalid media references (connect with empty array)
      if (
        value &&
        typeof value === 'object' &&
        'connect' in value &&
        Array.isArray(value.connect) &&
        value.connect.length === 0
      ) {
        // Remove the invalid media reference
        delete result[key];
        strapi.log.warn(`Removed invalid media reference for field ${key}`);
      }
      // Check for malformed references
      else if (
        value &&
        typeof value === 'object' &&
        'connect' in value &&
        (!Array.isArray(value.connect) || value.connect.some((id) => !id))
      ) {
        // Remove the invalid media reference
        delete result[key];
        strapi.log.warn(`Removed malformed media reference for field ${key}`);
      }
      // Process nested objects recursively
      else if (value && typeof value === 'object') {
        result[key] = this.sanitizeRecordBeforeCreate(value);
      }
    }

    return result;
  },

  /**
   * Import data from a JSON file
   * @param contentType - The target content type API ID
   * @param filePath - Path to the JSON file
   * @returns Results of the import operation
   */
  async importFromFile(contentType: string, filePath: string) {
    try {
      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      // Validate data format
      if (!Array.isArray(data)) {
        throw new Error('File content must be a JSON array');
      }

      // Process the import
      return await this.importData(contentType, data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON file: ${error.message}`);
      }
      throw error;
    }
  },
});

export default service;
