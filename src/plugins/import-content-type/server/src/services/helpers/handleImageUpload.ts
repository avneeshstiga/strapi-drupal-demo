import path from 'path';
import { checkFileExists, handleFolder } from '../../utils/media';
import FormData from 'form-data';
import axios from 'axios';
import https from 'https';
import fs from 'fs-extra';
import os from 'os';
import { convertSpaceToChar } from '../../utils/strings';

/**
 * Handle image upload to Strapi media library
 * @param imageUrl - Image URL
 * @param contentType - The target content type API ID
 * @returns Array of media IDs or original URL if upload fails
 */

export const handleImageUpload = async (
  imageUrl: string,
  contentType: string
): Promise<number[] | string[]> => {
  try {
    // Download and upload the image to Strapi
    const fileData = await downloadImage(imageUrl, contentType);

    // If download was successful, try to upload
    if (fileData && fileData.data) {
      const uploadedFile = await uploadFileToStrapiMediaLibrary(fileData);
      if (uploadedFile && uploadedFile.id) {
        strapi.log.info(`Processed image URL ${imageUrl} into media ID ${uploadedFile.id}`);
        return [uploadedFile.id];
      } else {
        strapi.log.warn(`Failed to upload image from URL ${imageUrl}, keeping original value`);
        return [imageUrl];
      }
    } else if (fileData && fileData.alreadyExists) {
      strapi.log.info(`Image ${fileData.name} already exists in strapi media library`);
      return [fileData.id];
    } else {
      strapi.log.warn(`Failed to download image from URL ${imageUrl}, keeping original value`);
      return [imageUrl];
    }
  } catch (error) {
    strapi.log.error(`Error processing image URL ${imageUrl}: ${error.message}`);
  }
};

/**
 * Download an image from a URL and prepare it for upload to Strapi
 * @param url - Image URL
 * @param contentType - The target content type API ID
 * @returns Object with file data ready for upload
 */
export const downloadImage = async (url: string, contentType: string) => {
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
    const name = convertSpaceToChar(path.basename(urlPath, extension), '$');
    const filename = `${name}${extension}`;

    const folderId = await handleFolder(url);

    strapi.log.info(`Checking if image ${filename} exists in strapi media library`);
    const fileId = await checkFileExists(filename, folderId);
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

    strapi.log.info(`Attempting to download image from ${url}`);

    const agent = new https.Agent({ rejectUnauthorized: false });
    // Download the image as a buffer
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000, // 15 seconds timeout
      maxContentLength: 10 * 1024 * 1024, // 10MB max size
      validateStatus: (status) => status === 200, // Only accept 200 responses
      httpsAgent: agent,
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
      strapi.log.error(`Error downloading image from ${url}: HTTP status ${error.response.status}`);
    } else if (error.request) {
      strapi.log.error(`Error downloading image from ${url}: No response received`);
    } else {
      strapi.log.error(`Error downloading image from ${url}: ${error.message}`);
    }
    return null;
  }
};

/**
 * Upload a file to Strapi's media library
 * @param fileData - File data object with buffer
 * @param name - Optional custom name for the file
 * @returns Uploaded file object
 */
export const uploadFileToStrapiMediaLibrary = async (fileData, name = null) => {
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

      // direct API upload
      return await uploadViaAPI(fileData, tmpFilePath, fileData.folderId);
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
};

/**
 * Upload a file to Strapi's media library using direct API call
 * @param fileData - File data object with data buffer
 * @param tmpFilePath - Path to temporary file
 * @param folderId - Folder ID to upload to
 * @returns Uploaded file object
 */
export const uploadViaAPI = async (fileData, tmpFilePath, folderId) => {
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

      return response.data.data[0];
    } else {
      strapi.log.error('API upload response invalid');
      return null;
    }
  } catch (apiError) {
    strapi.log.error(`API upload approach failed: ${apiError.message}`);
    return null;
  }
};
