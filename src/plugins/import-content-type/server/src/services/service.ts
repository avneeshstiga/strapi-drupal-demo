import type { Core } from '@strapi/strapi';
import fs from 'fs-extra';
import axios from 'axios';
import path from 'path';
import mime from 'mime-types';
import os from 'os';
import FormData from 'form-data'; // Node.js FormData implementation
import { validateRecordAgainstSchema } from '../utils/validateRecordAgainstSchema';
import { checkFileExists, checkFolderExists, createFolder } from '../utils/media';

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
   * @param contentType - The target content type API ID
   * @returns Object with file data ready for upload
   */
  async downloadImage(url: string, contentType: string) {
    try {
      if (!url || typeof url !== 'string') {
        strapi.log.error(`Invalid URL provided to downloadImage: ${url}`);
        return null;
      }

      // Try to validate the URL
      let validatedUrl;
      try {
        validatedUrl = new URL(url);
      } catch (error) {
        strapi.log.error(`Invalid URL format: ${url}`);
        return null;
      }

      // get filename from url
      const urlPath = validatedUrl.pathname;
      const extension = path.extname(urlPath) || '.jpg'; // Default to .jpg if no extension
      const name = path.basename(urlPath, extension);
      const filename = `${name}${extension}`;

      strapi.log.info(`Checking if image ${filename} exists in strapi media library`);
      // Check if folder exists
      let folderId = await checkFolderExists(contentType);
      if (!Boolean(folderId)) {
        strapi.log.info(`Folder ${contentType} does not exist, creating it`);
        folderId = await createFolder(contentType);
      } else {
        strapi.log.info(`Folder ${contentType} already exists, ${folderId}`);
        const fileId = await checkFileExists(filename);
        if (Boolean(fileId)) {
          strapi.log.info(`Image ${filename} already exists in strapi media library`);
          return {
            data: null,
            name: filename,
            id: fileId,
            folderId,
            alreadyExists: true,
          };
        }
      }

      strapi.log.info(`Attempting to download image from ${url}`);

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
      const buffer = Buffer.from(response.data);
      if (buffer.length === 0) {
        strapi.log.error(`Empty buffer created from ${url}`);
        return null;
      }

      const type = response.headers['content-type'];
      const mimeType = type || 'image/jpeg';

      // Validate content type if available
      if (type && !type.startsWith('image/')) {
        strapi.log.error(`URL returned non-image content type: ${type}`);
        return null;
      }

      // Return file data for upload
      return {
        data: buffer,
        name: filename,
        type: mimeType,
        size: buffer.length,
        folderId,
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
   * @param folderId - Folder ID to upload to
   * @returns Uploaded file object
   */
  async uploadViaAPI(fileData, tmpFilePath, folderId) {
    try {
      // Create form data for the API request
      const form = new FormData();

      // Append the file to form data
      form.append('file', fs.createReadStream(tmpFilePath));
      form.append('folderId', folderId);

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
      const apiUrl = `${serverUrl}/api/media/upload`;

      const response = await axios.post(apiUrl, form, { headers });
      strapi.log.info(`Posting to API URL: ${apiUrl}`);

      if (response.data && response.data.data && response.data.data[0].id) {
        strapi.log.info(`API upload succeeded with ID ${response.data.data[0].id}`);

        // await axios.put(
        //   `${serverUrl}/api/media/update`, // or `/upload/files/${fileId}` depending on plugin
        //   { id: response.data.data[0].id, folderId },
        //   { headers: { Authorization: `Bearer ${token}` } }
        // );

        return response.data.data[0];
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
      if (!fileData.name || !fileData.type || !fileData.folderId) {
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

      // Validate data exists
      if (!fileData.data) {
        strapi.log.error('Missing data in fileData');
        return null;
      }

      // Create a temporary file for upload
      let tmpFilePath = null;
      try {
        // Create a temporary file
        const tmpDir = path.join(os.tmpdir(), 'strapi-upload'); // isolate your own subdir
        tmpFilePath = path.join(tmpDir, fileData.name);

        // Ensure tmp dir exists
        await fs.ensureDir(tmpDir);

        // Write the buffer to a temporary file
        await fs.writeFile(tmpFilePath, fileData.data);
        strapi.log.info(`Created temporary file at ${tmpFilePath}`);

        // Try to upload using upload service first
        // try {
        //   // Prepare the file object in the format expected by Strapi 5

        //   // Upload using Strapi upload service
        //   const results = await uploadService.upload({
        //     files: [
        //       {
        //         name: fileData.name,
        //         type: fileData.type,
        //         size: fs.statSync(tmpFilePath).size,
        //         path: tmpFilePath,
        //       },
        //     ],
        //     data: {},
        //   });

        //   // Check if upload was successful
        //   if (results && Array.isArray(results) && results.length > 0 && results[0].id) {
        //     strapi.log.info(`Successfully uploaded file to media library with ID ${results[0].id}`);
        //     return results[0];
        //   } else {
        //     strapi.log.error('Upload service returned invalid result');
        //   }
        // } catch (uploadError) {
        //   strapi.log.error(`Error during upload service call: ${uploadError.message}`);
        //   if (uploadError.stack) {
        //     strapi.log.error(`Stack trace: ${uploadError.stack}`);
        //   }
        // }

        // If service upload failed, try direct API upload
        return await this.uploadViaAPI(fileData, tmpFilePath, fileData.folderId);
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
  async processObjectForImages(obj: any, contentType: string) {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle array case
    if (Array.isArray(obj)) {
      const results = await Promise.all(
        obj.map((item) => this.processObjectForImages(item, contentType))
      );
      return results;
    }

    // Make a copy of the object to avoid mutating the original
    const result = { ...obj };

    // Process each property
    for (const [key, value] of Object.entries(result)) {
      // If value is a string and an image URL
      if (typeof value === 'string' && this.isImageUrl(value)) {
        strapi.log.info('Inside Cond 1, for....', key);
        try {
          // Download and upload the image to Strapi
          strapi.log.info(`Processing image URL: ${value}`);
          const fileData = await this.downloadImage(value, contentType);

          // If download was successful, try to upload
          if (fileData && fileData.data) {
            const uploadedFile = await this.uploadFileToStrapiMediaLibrary(fileData);
            if (uploadedFile && uploadedFile.id) {
              // Replace the URL with the correct media reference format for Strapi 5
              result[key] = [uploadedFile.id];
              strapi.log.info(`Processed image URL ${value} into media ID ${uploadedFile.id}`);
            } else {
              strapi.log.warn(`Failed to upload image from URL ${value}, keeping original value`);
            }
          } else if (fileData && fileData.alreadyExists) {
            strapi.log.info(`Image ${fileData.name} already exists in strapi media library`);
            result[key] = [fileData.id];
          } else {
            strapi.log.warn(`Failed to download image from URL ${value}, keeping original value`);
          }
        } catch (error) {
          strapi.log.error(`Error processing image URL ${value}: ${error.message}`);
        }
      } else if (Array.isArray(value)) {
        strapi.log.info('Inside Cond 3, for.......', key);
        const processedArray: any[] = [];

        for (const item of value) {
          if (typeof item === 'string') {
            try {
              strapi.log.info(`Processing image URL from array: ${item}`);
              const fileData = await this.downloadImage(item, contentType);

              if (fileData && fileData.data) {
                const uploadedFile = await this.uploadFileToStrapiMediaLibrary(fileData);
                if (uploadedFile && uploadedFile.id) {
                  processedArray.push(uploadedFile.id);
                  strapi.log.info(
                    `Processed array image URL ${item} into media ID ${uploadedFile.id}`
                  );
                } else {
                  strapi.log.warn(`Failed to upload image from array URL ${item}, skipping`);
                  processedArray.push(item); // Optional: retain original if failed
                }
              } else if (fileData && fileData.alreadyExists) {
                strapi.log.info(`Image ${fileData.name} already exists in strapi media library`);
                processedArray.push(fileData.id);
              } else {
                strapi.log.warn(`Failed to download image from array URL ${item}, skipping`);
                processedArray.push(item);
              }
            } catch (error) {
              strapi.log.error(`Error processing image from array URL ${item}: ${error.message}`);
              processedArray.push(item);
            }
          } else if (item && typeof item === 'object' && item.url && this.isImageUrl(item.url)) {
            try {
              strapi.log.info(`Processing image object from array: ${item.url}`);
              const fileData = await this.downloadImage(item.url, contentType);

              if (fileData && fileData.data) {
                const caption = item.caption || item.alt || item.name || fileData.name;
                const uploadedFile = await this.uploadFileToStrapiMediaLibrary(fileData, caption);

                if (uploadedFile && uploadedFile.id) {
                  processedArray.push(uploadedFile.id);
                  strapi.log.info(
                    `Processed image object URL ${item.url} into media ID ${uploadedFile.id}`
                  );
                } else {
                  strapi.log.warn(`Failed to upload image from object ${item.url}, skipping`);
                  processedArray.push(item);
                }
              } else if (fileData && fileData.alreadyExists) {
                strapi.log.info(`Image ${fileData.name} already exists in strapi media library`);
                processedArray.push(fileData.id);
              } else {
                strapi.log.warn(`Failed to download image from object ${item.url}, skipping`);
                processedArray.push(item);
              }
            } catch (error) {
              strapi.log.error(
                `Error processing image object from array ${item.url}: ${error.message}`
              );
              processedArray.push(item);
            }
          } else {
            processedArray.push(item); // Keep original if not a valid image
          }
        }

        result[key] = processedArray;
      }
      // Handle special case for object with url property that might be an image
      else if (value && typeof value === 'object') {
        strapi.log.info('Inside Cond 2, for....', { key });
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
            const fileData = await this.downloadImage(objWithUrl.url, contentType);

            // If download was successful, try to upload
            if (fileData && fileData.data) {
              // Use caption from the object if available
              const caption =
                objWithUrl.caption || objWithUrl.alt || objWithUrl.name || fileData.name;
              const uploadedFile = await this.uploadFileToStrapiMediaLibrary(fileData, caption);

              if (uploadedFile && uploadedFile.id) {
                // Replace the object with the media reference using Strapi 5 format
                result[key] = [uploadedFile.id];
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
          result[key] = await this.processObjectForImages(value, contentType);
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
    const schema = strapi.contentTypes[`api::${contentType}.${contentType}`];

    if (!schema) {
      throw new Error(`Content type "${contentType}" not found`);
    }

    const results = {
      contentType,
      totalRecords: data.length,
      successful: 0,
      failed: 0,
      processedImages: 0,
      skippedImages: 0,
      errors: [] as { index: number; error: any }[],
      failedRecords: [] as any[],
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
          const processedRecord = await this.processObjectForImages(record, contentType);

          // Create the content type entry with processed image references
          strapi.log.info(`Creating content type ${contentType} entry with processed data`);

          // Clean up any failed image references before creating the entry
          const sanitizedRecord = this.sanitizeRecordBeforeCreate(processedRecord);
          strapi.log.info(`sanitizedRecord: ${JSON.stringify(sanitizedRecord, null, 2)}`);

          // Validate the record against the schema
          await validateRecordAgainstSchema(schema, sanitizedRecord);
          // Create entry in the specified content type
          await strapi.entityService.create(`api::${contentType}.${contentType}`, {
            data: sanitizedRecord,
          });

          results.successful++;
        } catch (error) {
          strapi.log.error(`Error processing record ${recordIndex}: ${error.message}`);
          results.failed++;
          results.errors.push({
            index: recordIndex,
            error: { ...error },
          });
          results.failedRecords.push(record);
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

  async transformDrupalToStrapi(
    contentType,
    drupalData,
    fieldsMapping = {},
    relationsMapping = {}
  ) {
    // Map Drupal JSON:API data to Strapi content-type format, including relations
    return drupalData.map((item) => {
      const strapiItem: Record<string, any> = {};

      // Map fields
      for (const [strapiField, drupalField] of Object.entries(fieldsMapping)) {
        strapiItem[strapiField] = item.attributes?.[drupalField as string];
      }

      // Map relationships
      for (const [strapiRel, drupalRel] of Object.entries(relationsMapping)) {
        const relData = item.relationships?.[drupalRel as string]?.data;
        if (Array.isArray(relData)) {
          strapiItem[strapiRel] = relData.map((rel: any) => rel.id);
        } else if (relData && relData.id) {
          strapiItem[strapiRel] = relData.id;
        }
      }

      // Only add drupal_id for reference, do not include any other Drupal keys
      strapiItem['drupal_id'] = item.id;

      return strapiItem;
    });
  },
});

export default service;
