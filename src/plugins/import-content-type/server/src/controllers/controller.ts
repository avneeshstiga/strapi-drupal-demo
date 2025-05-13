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

      // Check if files exist in the request
      if (!ctx.request.files || !Object.keys(ctx.request.files).length) {
        return ctx.badRequest('No files uploaded. Please upload a JSON file in form-data.');
      }

      // Get the file - handle both single file and array cases
      const fileField = Object.keys(ctx.request.files)[0];
      const fileData = ctx.request.files[fileField];
      const file = Array.isArray(fileData) ? fileData[0] : fileData;

      strapi.log.info(`Processing uploaded file: ${file.name}`);

      // Create temp file path
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `import_${Date.now()}_${file.name}`);

      try {
        // Read uploaded file data
        const fileContent = fs.readFileSync(file.path, 'utf8');

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
          file: file.name,
          recordsCount: jsonData.length,
          result,
        });
      } catch (error) {
        // Clean up temp file if it exists
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        throw error;
      }
    } catch (error) {
      strapi.log.error(`File upload error: ${error.message}`);
      return ctx.badRequest(error.message || 'Error processing uploaded file');
    }
  },
});

export default controller;
