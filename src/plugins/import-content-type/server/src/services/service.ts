import type { Core } from '@strapi/strapi';
import fs from 'fs';
import { FormData } from 'formdata-node';
import fetch, { blobFrom } from 'node-fetch';
import axios from 'axios';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import os from 'os';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
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
   * Download an image from a URL and save it as a temporary file
   * @param url - Image URL
   * @returns Object with file information
   */
  async downloadImage(url: string) {
    try {
      // Download the image as a buffer
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      // Generate a unique filename
      const urlPath = new URL(url).pathname; 
      const extension = path.extname(urlPath) || '.jpg'; // Default to .jpg if no extension
      const filename = `${uuidv4()}${extension}`;
      const tmpFilePath = path.join(os.tmpdir(), filename);

      // Determine MIME type
      const mimeType = mime.lookup(extension) || 'image/jpeg';

      // Write buffer to temporary file
      fs.writeFileSync(tmpFilePath, Buffer.from(response.data));

      // Prepare file data for upload
      const fileData = {
        path: tmpFilePath,
        name: filename,
        type: mimeType,
        size: fs.statSync(tmpFilePath).size,
      };

      return fileData;
    } catch (error) {
      strapi.log.error(`Error downloading image from ${url}: ${error.message}`);
      return null;
    }
  },

    /**
   * Upload a file to Strapi's media library
   * @param fileData - File data object
   * @param name - Optional custom name for the file
   * @returns Uploaded file object
   */
  async uploadFileToStrapiMediaLibrary(fileData, name = null) {
    try {
      const uploadService = strapi.plugin('upload').service('upload');
 
      const [uploadedFile] = await uploadService.upload({
        files: fileData,
        data: {
          fileInfo: {
            alternativeText: name || fileData.name || '',
            caption: name || fileData.name || '',
            name: name || fileData.name.replace(/\.[^/.]+$/, '') || '', // Remove extension from name
          },
        },
      });
 
      return uploadedFile;
    } catch (error) {
      strapi.log.error(`Error uploading file to Strapi media library: ${error.message}`);
      return null;
    }
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
    };

    // Process records in batches to avoid overwhelming the database
    const batchSize = 50;
    const batches = Math.ceil(data.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      // Process each record in the current batch
      const batchPromises = batch.map(async (record, index) => {
        const recordIndex = start + index;
        try {
          strapi.log.info('Processing record', { recordIndex });

          const imageUrl = record.article_image;
          const formData =  await this.downloadImage(imageUrl)
          const uploadFile = await this.uploadFileToStrapiMediaLibrary(formData)

          // Download the image from the URL
          // const imageResponse = await fetch(imageUrl);
          // if (!imageResponse.ok) {
          //   throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
          // }

          // const arrayBuffer = await imageResponse.arrayBuffer();
          // const buffer = Buffer.from(arrayBuffer);
          // const fileName = imageUrl.split('/').pop() || `image-${recordIndex}.png`;

          // const form = new FormData();
          // const blob = new Blob([buffer], { type: 'image/png' });
          // form.append('files', blob, fileName);
          // const uploadResponse = await fetch('http://localhost:1337/api/upload', { //change to plugin
          //   method: 'POST',
          //   body: form,
          // });

          // if (!uploadResponse.ok) {
          //   const errorText = await uploadResponse.text();
          //   throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
          // }
          // const uploadJson = await uploadResponse.json();
          // if (!Array.isArray(uploadJson) || uploadJson.length === 0) {
          //   throw new Error('Upload succeeded but returned no file data.');
          // }

          // record.article_image = uploadJson[0].id; // Set to media ID

          // strapi.log.info('Upload response', uploadJson[0]);


          await strapi.entityService.create(`api::${contentType}.${contentType}`, {
            data: record,
          });

          results.successful++;
        } catch (err) {
          strapi.log.error(`Error processing record at index ${recordIndex}`, err);
          results.failed++;
          results.errors.push({
            index: recordIndex,
            message: err.message || 'Unknown error',
          });
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
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
