import type { Core } from '@strapi/strapi';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import axios from 'axios';
import https from 'https';

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

      let filePath = null;
      if (result?.errors?.length > 0 || result?.failedRecords?.length > 0) {
        try {
          // Create a temporary file with date-based directory structure
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
          const timeStr = now.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // YYYY-MM-DDThh-mm-ss format

          // Create base logs directory
          const baseLogDir = path.join(os.homedir(), 'strapi-logs');
          // Create date-specific directory
          const dateDir = path.join(baseLogDir, dateStr);

          // Ensure tmp dir exists
          await fs.ensureDir(baseLogDir);
          await fs.ensureDir(dateDir);

          if (result.errors.length > 0) {
            // Create unique filename with timestamp
            const logFileName = `${contentType}-errors-${timeStr}.json`;
            filePath = path.join(dateDir, logFileName);

            fs.writeFileSync(filePath, JSON.stringify(result.errors, null, 2));
            strapi.log.info(`Created errors log file at ${filePath}`);
          }

          if (result.failedRecords.length > 0) {
            const logFileName = `${contentType}-failed-records-${timeStr}.json`;
            filePath = path.join(dateDir, logFileName);

            fs.writeFileSync(filePath, JSON.stringify(result.failedRecords, null, 2));
            strapi.log.info(`Created failed records log file at ${filePath}`);
          }
        } catch (error) {
          strapi.log.error(`Error creating logs directory: ${error.message}`);
        }
      }

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

  async fetchDrupalData(ctx) {
    try {
      const {
        baseUrl,
        endpoint,
        params,
        dataController,
        contentType,
        fieldsMapping,
        relationsMapping,
        convertToStrapi,
      } = ctx.request.body;
      const startTime = Date.now();
      if (!baseUrl || !endpoint) {
        return ctx.badRequest('baseUrl and endpoint are required in the request body');
      }
      let page = 1;
      let allResults = [];
      let includedResult = [];
      let hasNextPage = true;
      let refinedBaseUrl = baseUrl;
      const agent = new https.Agent({ rejectUnauthorized: false });

      while (hasNextPage) {
        const limit = dataController.limit || 50;
        const offset = dataController.limit ? 0 : (page - 1) * limit;
        refinedBaseUrl = baseUrl.replace(/\/$/, '');
        const refinedEndpoint = endpoint.replace(/^\//, '');
        const url = `${refinedBaseUrl}/${refinedEndpoint}`;
        const urlWithQuery = `${url}?page[limit]=${limit}&page[offset]=${offset}`;
        const queryParams = { ...params };
        try {
          const response = await axios.get(urlWithQuery, {
            params: queryParams,
            httpsAgent: agent,
          });
          const data = response.data && response.data.data ? response.data.data : [];
          if (data.length === 0) {
            strapi.log.info(`--- No more data to fetch --- Last Page: ${page}`);
            hasNextPage = false;
          } else {
            strapi.log.info(`--- Page ${page} ---`);
            allResults = allResults.concat(data);
            includedResult = response.data && response.data.included ? response.data.included : [];
            dataController.limit && (hasNextPage = false);
            page++;
          }
        } catch (err) {
          strapi.log.error(`Error fetching from Drupal: ${err.message}`);
          return ctx.badRequest(`Error fetching from Drupal: ${err.message}`);
        }
      }

      // If strapi param is true, transform the data
      if (convertToStrapi && contentType) {
        const service = strapi.plugin('import-content-type').service('service');
        const transformed = await service.transformDrupalToStrapi(
          refinedBaseUrl,
          allResults,
          fieldsMapping || {},
          relationsMapping || {},
          includedResult
        );

        if (!transformed || !Array.isArray(transformed)) {
          return ctx.badRequest('Request body must contain a "data" array');
        }

        // Log import request for debugging
        strapi.log.info(`Importing ${transformed.length} records into ${contentType}`);

        // Call service to handle the import
        const result = await strapi
          .plugin('import-content-type')
          .service('service')
          .importData(contentType, transformed);

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000 / 60;

        return ctx.send({
          success: true,
          result,
          duration: `${duration} minutes`,
        });
      }
    } catch (error) {
      strapi.log.error(`fetchDrupalData error: ${error.message}`);
      return ctx.badRequest(error.message || 'Error fetching from Drupal');
    }
  },

  async deleteContentType(ctx) {
    try {
      const { contentType } = ctx.params;
      const entries = (await strapi.entityService.findMany(`api::${contentType}.${contentType}`, {
        fields: ['id'],
        limit: -1, // Get all (be cautious!)
      })) as any[];

      for (const entry of entries) {
        strapi.log.info(`Deleting ${contentType} with id: ${entry.id}`);
        await strapi.entityService.delete(`api::${contentType}.${contentType}`, entry.id);
      }

      return ctx.send({ success: true, deleted: entries.length });
    } catch (error) {
      strapi.log.error(`deleteContentType error: ${error.message}`);
      return ctx.badRequest(error.message || 'Error deleting content type');
    }
  },
});

export default controller;
