import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';
import os from 'os';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('import-content-type')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },

  /**
   * Import data into a content type
   * @param ctx Koa context
   */
  async importData(ctx) {
    try {
      const { contentType } = ctx.params;
      const { data } = ctx.request.body;

      if (!contentType) {
        return ctx.badRequest('Content type parameter is required');
      }

      if (!data || !Array.isArray(data)) {
        return ctx.badRequest('Request body must contain a "data" array');
      }

      // Log import request for debugging
      strapi.log.info(`Importing ${data.length} records into ${contentType}`);

      // Call service to handle the import
      const result = await strapi
        .plugin('import-content-type')
        .service('service')
        .importData(contentType, data);

      return ctx.send({
        success: true,
        result,
      });
    } catch (error) {
      strapi.log.error(`Import error: ${error.message}`);
      return ctx.badRequest(error.message || 'An error occurred during import');
    }
  },

  /**
   * Alternative importData method that accepts JSON strings (easier for testing)
   * @param ctx Koa context
   */
  async importJsonData(ctx) {
    try {
      const { contentType } = ctx.params;
      const { jsonData } = ctx.request.body;

      if (!contentType) {
        return ctx.badRequest('Content type parameter is required');
      }

      if (!jsonData || typeof jsonData !== 'string') {
        return ctx.badRequest('Request body must contain a "jsonData" string field');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
        if (!Array.isArray(parsedData)) {
          return ctx.badRequest('JSON data must be an array');
        }
      } catch (parseError) {
        return ctx.badRequest(`Invalid JSON: ${parseError.message}`);
      }

      // Log import request for debugging
      strapi.log.info(`Importing ${parsedData.length} records into ${contentType}`);

      // Call service to handle the import
      const result = await strapi
        .plugin('import-content-type')
        .service('service')
        .importData(contentType, parsedData);

      return ctx.send({
        success: true,
        result,
      });
    } catch (error) {
      strapi.log.error(`Import error: ${error.message}`);
      return ctx.badRequest(error.message || 'An error occurred during import');
    }
  },

  /**
   * Handle file upload from form-data, validate JSON content, and import data
   * @param ctx Koa context
   */
  async handleFileUpload(ctx) {
    try {
      const { contentType } = ctx.params;

      if (!contentType) {
        return ctx.badRequest('Content type parameter is required');
      }

      // Debug: Log the entire request structure
      strapi.log.info('Request files structure:', {
        files: ctx.request.files,
        body: ctx.request.body,
        keys: ctx.request.files ? Object.keys(ctx.request.files) : [],
      });

      // Check if files exist in the request
      if (!ctx.request.files || Object.keys(ctx.request.files).length === 0) {
        return ctx.badRequest('No files uploaded. Please upload a JSON file in form-data.');
      }

      // Get the field name used for the file upload
      const fileField = Object.keys(ctx.request.files)[0];
      strapi.log.info(`File field found: ${fileField}`);

      // Get the file data
      const fileData = ctx.request.files[fileField];

      // Debug log the file data structure
      strapi.log.info('File data structure:', JSON.stringify(fileData, null, 2));

      if (!fileData) {
        return ctx.badRequest(`No file data found for field: ${fileField}`);
      }

      // Handle both single file and array of files
      const file = Array.isArray(fileData) ? fileData[0] : fileData;

      if (!file) {
        return ctx.badRequest('File data is invalid or empty');
      }

      // Log detailed file info
      strapi.log.info(`Processing uploaded file:`, {
        name: file.name,
        size: file.size,
        path: file.path,
        type: file.type,
      });

      if (!file.path) {
        return ctx.badRequest('File path is missing. The upload may have failed.');
      }

      try {
        // Read uploaded file data
        const fileContent = fs.readFileSync(file.path, 'utf8');
        strapi.log.info(`Successfully read file content, size: ${fileContent.length} chars`);

        // Validate JSON content
        let jsonData;
        try {
          jsonData = JSON.parse(fileContent);

          // Validate it's an array
          if (!Array.isArray(jsonData)) {
            return ctx.badRequest('File must contain a JSON array of records');
          }

          strapi.log.info(`Valid JSON found with ${jsonData.length} records`);
        } catch (jsonError) {
          return ctx.badRequest(`Invalid JSON in file: ${jsonError.message}`);
        }

        // Process the import
        const result = await strapi
          .plugin('import-content-type')
          .service('service')
          .importData(contentType, jsonData);

        return ctx.send({
          success: true,
          file: file.name || 'uploaded-file',
          recordsCount: jsonData.length,
          result,
        });
      } catch (fileError) {
        strapi.log.error(`File processing error: ${fileError.message}`);
        return ctx.badRequest(`Error processing file: ${fileError.message}`);
      }
    } catch (error) {
      strapi.log.error(`File upload error: ${error.message}`);
      return ctx.badRequest(error.message || 'Error processing uploaded file');
    }
  },

  /**
   * Import data from a local file on the server
   * @param ctx Koa context
   */
  async importFromLocalFile(ctx) {
    try {
      const { contentType } = ctx.params;
      const { filePath } = ctx.request.body;

      if (!contentType) {
        return ctx.badRequest('Content type parameter is required');
      }

      if (!filePath) {
        return ctx.badRequest('File path is required in the request body');
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return ctx.badRequest(`File not found at path: ${filePath}`);
      }

      strapi.log.info(`Importing data from local file: ${filePath}`);

      try {
        // Read file content
        const fileContent = fs.readFileSync(filePath, 'utf8');
        strapi.log.info(`Successfully read file content, size: ${fileContent.length} chars`);

        // Parse and validate JSON content
        let jsonData;
        try {
          jsonData = JSON.parse(fileContent);

          // Validate it's an array
          if (!Array.isArray(jsonData)) {
            return ctx.badRequest('File must contain a JSON array of records');
          }

          strapi.log.info(`Valid JSON found with ${jsonData.length} records`);
        } catch (jsonError) {
          return ctx.badRequest(`Invalid JSON in file: ${jsonError.message}`);
        }

        // Process the import
        const result = await strapi
          .plugin('import-content-type')
          .service('service')
          .importData(contentType, jsonData);

        return ctx.send({
          success: true,
          file: path.basename(filePath),
          recordsCount: jsonData.length,
          result,
        });
      } catch (fileError) {
        strapi.log.error(`File processing error: ${fileError.message}`);
        return ctx.badRequest(`Error processing file: ${fileError.message}`);
      }
    } catch (error) {
      strapi.log.error(`Local file import error: ${error.message}`);
      return ctx.badRequest(error.message || 'Error importing from local file');
    }
  },
});

export default controller;
