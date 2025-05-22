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
        contentType,
        fieldsMapping,
        relationsMapping,
        strapiData,
      } = ctx.request.body;
      if (!baseUrl || !endpoint) {
        return ctx.badRequest('baseUrl and endpoint are required in the request body');
      }
      let page = 0;
      let allResults = [];
      let keepFetching = true;
      const agent = new https.Agent({ rejectUnauthorized: false });

      while (keepFetching) {
        const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
        const queryParams = { ...params, page: { limit: 50, offset: page * 50 } };
        try {
          const response = await axios.get(url, { params: queryParams, httpsAgent: agent });
          const data = response.data && response.data.data ? response.data.data : [];
          if (Array.isArray(data) && data.length > 0) {
            allResults = allResults.concat(data);
            page++;
          } else {
            keepFetching = false;
          }
        } catch (err) {
          strapi.log.error(`Error fetching from Drupal: ${err.message}`);
          return ctx.badRequest(`Error fetching from Drupal: ${err.message}`);
        }
      }

      // If strapi param is true, transform the data
      if (strapiData && contentType) {
        const service = strapi.plugin('import-content-type').service('service');
        const transformed = await service.transformDrupalToStrapi(
          contentType,
          allResults,
          fieldsMapping || {},
          relationsMapping || {}
        );
        return ctx.send({ success: true, count: transformed.length, data: transformed });
      }

      ctx.send({ success: true, count: allResults.length, data: allResults });
    } catch (error) {
      strapi.log.error(`fetchDrupalData error: ${error.message}`);
      return ctx.badRequest(error.message || 'Error fetching from Drupal');
    }
  },

  async generateSchemaFromDrupal(ctx) {
    try {
      const { baseUrl, endpoint, params } = ctx.request.body;
      if (!baseUrl || !endpoint) {
        return ctx.badRequest('baseUrl and endpoint are required in the request body');
      }
      const agent = new https.Agent({ rejectUnauthorized: false });
      const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
      let response;
      try {
        response = await axios.get(url, { params, httpsAgent: agent });
      } catch (err) {
        strapi.log.error(`Error fetching from Drupal: ${err.message}`);
        return ctx.badRequest(`Error fetching from Drupal: ${err.message}`);
      }
      const data = response.data && response.data.data ? response.data.data : [];
      if (!Array.isArray(data) || data.length === 0) {
        return ctx.badRequest('No data found in Drupal response');
      }
      // Use the first item to infer schema
      const item = data[0];
      const attributes = item.attributes || {};
      const relationships = item.relationships || {};
      const unwantedKeys = [
        'drupal_internal__tid',
        'drupal_internal__revision_id',
        'revision_created',
        'revision_log_message',
        'revision_translation_affected',
        'content_translation_source',
        'content_translation_created',
        'content_translation_outdated',
        'weight',
        'changed',
      ];
      const schema = {
        kind: 'collectionType',
        collectionName: endpoint.replace(/\//g, '_'),
        info: {
          singularName: endpoint.split('/').pop(),
          pluralName: endpoint.split('/').pop() + 's',
          displayName: endpoint.split('/').pop().replace(/_/g, ' '),
          description: `Imported from Drupal 8: ${endpoint}`,
        },
        options: {
          draftAndPublish: true,
        },
        pluginOptions: {},
        attributes: {},
      };
      // Infer field types, skipping unwanted keys and mapping langcode/status and custom field renames
      for (const [key, value] of Object.entries(attributes)) {
        if (unwantedKeys.includes(key)) continue;
        let mappedKey = key;
        if (key === 'langcode') {
          mappedKey = 'language';
        } else if (key === 'status') {
          mappedKey = 'published';
        } else if (key === 'field_state_highlight') {
          mappedKey = 'highlight';
        } else if (key === 'field_taxonomy_pim_id') {
          mappedKey = 'taxonomy_pim_id';
        }
        if (mappedKey === 'description') {
          schema.attributes[mappedKey] = { type: 'blocks' };
        } else if (mappedKey === 'language') {
          schema.attributes[mappedKey] = { type: 'string' };
        } else if (mappedKey === 'published') {
          schema.attributes[mappedKey] = { type: 'boolean' };
        } else if (typeof value === 'string') {
          schema.attributes[mappedKey] = { type: 'string' };
        } else if (typeof value === 'number') {
          schema.attributes[mappedKey] = { type: 'integer' };
        } else if (typeof value === 'boolean') {
          schema.attributes[mappedKey] = { type: 'boolean' };
        } else if (value instanceof Date) {
          schema.attributes[mappedKey] = { type: 'datetime' };
        } else if (Array.isArray(value)) {
          schema.attributes[mappedKey] = { type: 'json' };
        } else if (typeof value === 'object' && value !== null) {
          schema.attributes[mappedKey] = { type: 'json' };
        } else {
          schema.attributes[mappedKey] = { type: 'string' };
        }
      }
      // Infer relationships
      for (const [relKey, relValue] of Object.entries(relationships)) {
        if (relValue && typeof relValue === 'object' && 'data' in relValue) {
          const relData = (relValue as any).data;
          if (Array.isArray(relData)) {
            schema.attributes[relKey] = {
              type: 'relation',
              relation: 'oneToMany',
              target: relData[0]?.type ? `api::${relData[0].type.replace(/--/g, '.')}` : 'unknown',
            };
          } else if (relData && typeof relData === 'object' && 'type' in relData) {
            schema.attributes[relKey] = {
              type: 'relation',
              relation: 'manyToOne',
              target: `api::${relData.type.replace(/--/g, '.')}`,
            };
          }
        }
      }
      ctx.send({ ...schema });
      // for (const [relKey, relValue] of Object.entries(relationships)) {
      //   if (relValue && typeof relValue === 'object' && 'data' in relValue) {
      //     const relData = (relValue as any).data;
      //     if (Array.isArray(relData)) {
      //       schema.attributes[relKey] = {
      //         type: 'relation',
      //         relation: 'oneToMany',
      //         target: relData[0]?.type ? `api::${relData[0].type.replace(/--/g, '.')}` : 'unknown',
      //       };
      //     } else if (relData && typeof relData === 'object' && 'type' in relData) {
      //       schema.attributes[relKey] = {
      //         type: 'relation',
      //         relation: 'manyToOne',
      //         target: `api::${relData.type.replace(/--/g, '.')}`,
      //       };
      //     }
      //   }
      // }
      // Normalize content type name to kebab-case (replace underscores with dashes)
      // let contentTypeName = (schema.info.singularName || endpoint.split('/').pop() || '').replace(
      //   /_/g,
      //   '-'
      // );
      // schema.info.singularName = contentTypeName;
      // schema.info.pluralName = contentTypeName + 's';
      // schema.collectionName = contentTypeName + 's';

      // // Capitalize the first letter of each word for displayName
      // const displayNameRaw = (endpoint.split('/').pop() || '').replace(/_/g, ' ');
      // const displayName = displayNameRaw.replace(/\b\w/g, (c) => c.toUpperCase());
      // schema.info.displayName = displayName;

      // const schemaPath = path.join(
      //   strapi.dirs.app.root,
      //   'src',
      //   'api',
      //   contentTypeName,
      //   'content-types',
      //   contentTypeName,
      //   'schema.json'
      // );
      // await fs.ensureDir(path.dirname(schemaPath));
      // await fs.writeJson(schemaPath, schema, { spaces: 2 });
      // ctx.send({
      //   success: true,
      //   schema,
      //   message: `Content type '${contentTypeName}' created. Please restart Strapi to apply changes.`,
      // });
    } catch (error) {
      strapi.log.error(`generateSchemaFromDrupal error: ${error.message}`);
      return ctx.badRequest(error.message || 'Error generating schema from Drupal');
    }
  },
});

export default controller;
