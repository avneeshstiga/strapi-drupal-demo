import type { Core } from '@strapi/strapi';
import fs from 'fs-extra';
import { validateRecordAgainstSchema } from '../utils/validateRecordAgainstSchema';
import {
  downloadImage,
  handleImageUpload,
  uploadFileToStrapiMediaLibrary,
} from './helpers/handleImageUpload';
import { handleRelation } from './helpers/handleRelation';
import { findStrapiDocument } from '../utils/strapi-queries';

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
        strapi.log.info(`Processing image URL: ${value}`);
        const processedImage = await handleImageUpload(value, contentType);
        result[key] = [processedImage];
      } else if (Array.isArray(value)) {
        const processedArray: any[] = [];

        for (const item of value) {
          if (typeof item === 'string' && this.isImageUrl(item)) {
            strapi.log.info(`Processing image URL from array: ${item}`);
            const processedImage = await handleImageUpload(item, contentType);
            processedArray.push(processedImage);
          } else if (item && typeof item === 'object' && item.url && this.isImageUrl(item.url)) {
            strapi.log.info(`Processing image object from array: ${item.url}`);
            const processedImage = await handleImageUpload(item.url, contentType);
            processedArray.push(processedImage);
          } else if (!this.isImageUrl(item)) {
            processedArray.push(item);
          }
        }

        result[key] = processedArray;
      } else if (value && typeof value === 'object') {
        // Handle special case for object with url property that might be an image
        strapi.log.info(`Special case: Processing image as object: ${key}`);
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
            const fileData = await downloadImage(objWithUrl.url, contentType);

            // If download was successful, try to upload
            if (fileData && fileData.data) {
              // Use caption from the object if available
              const caption =
                objWithUrl.caption || objWithUrl.alt || objWithUrl.name || fileData.name;
              const uploadedFile = await uploadFileToStrapiMediaLibrary(fileData, caption);

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
            throw new Error(
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
  async importData(contentType: string, data: any[], update = false) {
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
      errors: [] as { index: number; error: any }[],
      failedRecords: [] as any[],
    };

    // Process records in batches to avoid overwhelming the database
    const batchSize = 10; // Reduced batch size for better error handling
    const batches = Math.ceil(data.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      for (let index = 0; index < batch.length; index++) {
        const record = batch[index];
        const recordIndex = start + index;
        let sanitizedRecord;
        try {
          strapi.log.info(`Processing record ${recordIndex} for images`);
          const processedRecord = await this.processObjectForImages(record, contentType);
          sanitizedRecord = this.sanitizeRecordBeforeCreate(processedRecord);

          const { status, drupal_id, ...rest } = sanitizedRecord;
          await validateRecordAgainstSchema(schema, rest, update);
          if (update) {
            const { id: strapiId, publishedAt } = await findStrapiDocument(drupal_id, contentType);
            await strapi.entityService.update(`api::${contentType}.${contentType}`, strapiId, {
              data: { ...rest, publishedAt },
            });
          } else {
            await strapi.entityService.create(`api::${contentType}.${contentType}`, {
              data: { ...rest, drupal_id },
              publishedAt: status ?? 'draft',
            });
          }

          results.successful++;
        } catch (error) {
          strapi.log.error(`Error processing record ${recordIndex}: ${error.message}`);
          const { status, ...rest } = sanitizedRecord;

          results.failed++;
          results.errors.push({
            index: recordIndex,
            error: { ...error },
          });
          results.failedRecords.push(rest);
        }
      }

      // Optional: short delay between batches to reduce pressure
      await new Promise((resolve) => setTimeout(resolve, 200));
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

  /**
   * Transform Drupal JSON:API data to Strapi content-type format, including relations
   * @param refinedBaseUrl - The base URL of the Drupal site
   * @param drupalData - The Drupal JSON:API data
   * @param fieldsMapping - The mapping of Drupal fields to Strapi fields
   * @param relationsMapping - The mapping of Drupal relationships to Strapi relationships
   * @param includedResult - The included results from the Drupal JSON:API response
   * @returns The transformed Strapi content-type data
   */
  async transformDrupalToStrapi(
    refinedBaseUrl,
    drupalData,
    fieldsMapping = {},
    relationsMapping = {},
    includedResult = [],
    contentType
  ) {
    const results = {
      totalRecords: drupalData.length,
      successful: 0,
      failed: 0,
      errors: [] as { index: number; error: any }[],
      failedRecords: [] as any[],
    };

    // Map Drupal JSON:API data to Strapi content-type format, including relations
    // First, map all items and resolve all promises
    const transformed = await Promise.all(
      drupalData.map(async (item, index) => {
        const strapiItem: Record<string, any> = {};

        // Map fields
        for (const [strapiField, drupalField] of Object.entries(fieldsMapping)) {
          strapiItem[strapiField] = item.attributes?.[drupalField as string];
        }

        // Map relationships
        for (const [strapiRelKey, drupalRelKey] of Object.entries(relationsMapping)) {
          const relationshipData = item.relationships?.[drupalRelKey as string]?.data;

          if (!relationshipData) {
            strapiItem[strapiRelKey] = null;
            strapi.log.info(
              `No relationship data found for strapi key: ${strapiRelKey}, drupal key: ${drupalRelKey}`
            );
            continue;
          }

          try {
            const data = await handleRelation(
              refinedBaseUrl,
              relationshipData,
              strapiRelKey,
              includedResult,
              contentType
            );
            strapiItem[strapiRelKey] = data;

            results.successful++;
          } catch (error) {
            strapi.log.error(`Error processing relationship ${strapiRelKey}: ${error.message}`);
            results.failed++;
            results.errors.push({
              index: index,
              error: { message: error.message },
            });
            results.failedRecords.push(item);
          }
        }

        // Optionally, include the original Drupal id for reference
        strapiItem['drupal_id'] = item.id;
        strapi.log.info(`strapiItem: ${JSON.stringify(strapiItem, null, 2)}`);

        return strapiItem;
      })
    );

    return {
      transformedResult: results,
      transformed,
    };
  },
});

export default service;
