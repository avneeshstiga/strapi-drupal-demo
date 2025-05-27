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
        const limit = 50;
        const offset = (page - 1) * limit;
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

  /**
   * Import Drupal users into Strapi user-admin content type
   * @param ctx Koa context
   */
  async importDrupalUserInStrapi(ctx) {
    try {
      const startTime = Date.now();

      // Get parameters from request body
      const { drupalUrl = 'https://bjp.org/user-export-strapi', contentType = 'user-admin' } =
        ctx.request.body || {};

      strapi.log.info(`Fetching Drupal users from: ${drupalUrl}`);

      // Create HTTPS agent to handle SSL issues
      const agent = new https.Agent({ rejectUnauthorized: false });

      // Fetch data from Drupal API
      const response = await axios.get(drupalUrl, {
        httpsAgent: agent,
        timeout: 30000, // 30 seconds timeout
      });

      let drupalUsers = response.data;

      if (!Array.isArray(drupalUsers)) {
        return ctx.badRequest('Invalid response from Drupal API - expected an array');
      }

      // Transform Drupal user data to Strapi format
      const transformedUsers = drupalUsers.map((drupalUser) => {
        // Helper function to safely extract value from Drupal field arrays
        const extractValue = (field, defaultValue = null) => {
          if (Array.isArray(field) && field.length > 0 && field[0].value !== undefined) {
            return field[0].value;
          }
          return defaultValue;
        };

        // Helper function to extract domain UUIDs from field arrays
        const extractDomainUuids = (field) => {
          if (Array.isArray(field)) {
            return field.map((item) => item.target_uuid).filter((uuid) => uuid);
          }
          return [];
        };

        // Extract basic user information
        const uid = extractValue(drupalUser.uid);
        const username = extractValue(drupalUser.name);
        const email = extractValue(drupalUser.mail);
        const fullName = extractValue(drupalUser.field_full_name);
        const mobileNumber = extractValue(drupalUser.field_mobile_number);
        const pimUserId = extractValue(drupalUser.field_pim_user_id);
        const uuid = extractValue(drupalUser.uuid);

        // Extract domain relations
        const domainAccessUuids = extractDomainUuids(drupalUser.field_domain_access);
        const domainAdminUuids = extractDomainUuids(drupalUser.field_domain_admin);

        // Create Strapi user object
        const strapiUser = {
          username: username || email, // Use email as fallback for username
          full_name: fullName,
          email_address: username, // Map from name field
          mobile_number: mobileNumber ? parseInt(mobileNumber, 10) : null,
          pim_User_id: pimUserId,
          drupal_id: uuid, // Map from uuid field
          google_analytics_settings: true, // Default value from schema
          // Store domain UUIDs for later relation mapping
          _domainAccessUuids: domainAccessUuids,
          _domainAdminUuids: domainAdminUuids,
          // Note: admin_user, picture, and site_language will need to be handled separately
          // as they require relations/components that may not exist yet
        };

        // Remove null/undefined values (but keep domain UUID arrays even if empty)
        Object.keys(strapiUser).forEach((key) => {
          if (strapiUser[key] === null || strapiUser[key] === undefined) {
            delete strapiUser[key];
          }
        });

        return strapiUser;
      });

      strapi.log.info(`Transformed ${transformedUsers.length} users for Strapi import`);

      // First, create admin users in Strapi's admin users table
      const adminUsersCreated = [];
      const adminUsersErrors = [];

      // Helper function to safely extract value from Drupal field arrays
      const extractValue = (field, defaultValue = null) => {
        if (Array.isArray(field) && field.length > 0 && field[0].value !== undefined) {
          return field[0].value;
        }
        return defaultValue;
      };

      for (const drupalUser of drupalUsers) {
        try {
          const username = extractValue(drupalUser.name);
          const email = extractValue(drupalUser.mail);
          const fullName = extractValue(drupalUser.field_full_name);
          const uuid = extractValue(drupalUser.uuid);
          const status = extractValue(drupalUser.status, true);
          const langcode = extractValue(drupalUser.langcode, 'en');

          // Skip if no username or email
          if (!username || !email) {
            strapi.log.warn(`Skipping user creation - missing username or email for UUID: ${uuid}`);
            continue;
          }

          // Split full name into first and last name
          const nameParts = fullName ? fullName.trim().split(' ') : [];
          const firstName = nameParts[0] || username || 'Unknown';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

          // Check if admin user already exists
          const existingUser = await strapi.db.query('admin::user').findOne({
            where: {
              $or: [{ username: username }, { email: email }],
            },
          });

          if (existingUser) {
            strapi.log.info(`Admin user already exists: ${username} (${email})`);
            // Still add to created list for relationship mapping
            adminUsersCreated.push({
              id: existingUser.id,
              username: existingUser.username,
              email: existingUser.email,
              drupalUuid: uuid,
              isExisting: true,
            });
            continue;
          }

          // Create admin user
          const adminUserData = {
            firstname: firstName,
            lastname: lastName,
            username: username,
            email: email,
            isActive: status,
            blocked: !status,
            preferedLanguage: langcode,
            // Note: password will be auto-generated, user will need to reset it
          };

          const createdAdminUser = await strapi.db.query('admin::user').create({
            data: adminUserData,
          });

          adminUsersCreated.push({
            id: createdAdminUser.id,
            username: createdAdminUser.username,
            email: createdAdminUser.email,
            drupalUuid: uuid,
            isExisting: false,
          });

          strapi.log.info(
            `Created admin user: ${createdAdminUser.username} (ID: ${createdAdminUser.id})`
          );
        } catch (adminError) {
          const username = extractValue(drupalUser.name);
          const email = extractValue(drupalUser.mail);
          const identifier = username || email || 'unknown';

          strapi.log.error(`Error creating admin user ${identifier}: ${adminError.message}`);
          adminUsersErrors.push({
            identifier,
            error: adminError.message,
          });
        }
      }

      // Now update transformedUsers to include admin_user relationships
      const transformedUsersWithRelations = transformedUsers.map((strapiUser) => {
        // Find the corresponding admin user by drupal_id (uuid)
        const matchingAdminUser = adminUsersCreated.find(
          (adminUser) => adminUser.drupalUuid === strapiUser.drupal_id
        );

        if (matchingAdminUser) {
          return {
            ...strapiUser,
            admin_user: matchingAdminUser.id, // Create the relationship
          };
        }

        return strapiUser;
      });

      strapi.log.info(
        `Updated ${transformedUsersWithRelations.length} user-admin entries with admin_user relationships`
      );

      // Resolve domain relations by mapping UUIDs to domain IDs
      strapi.log.info('Resolving domain relations...');

      // Get all domains from Strapi to create UUID to ID mapping
      const allDomains = await strapi.entityService.findMany('api::domain.domain', {
        fields: ['id', 'bjp_uuid'],
        limit: -1, // Get all domains
      });

      // Create UUID to ID mapping
      const domainUuidToIdMap = {};
      allDomains.forEach((domain) => {
        if (domain.bjp_uuid) {
          domainUuidToIdMap[domain.bjp_uuid] = domain.id;
        }
      });

      strapi.log.info(
        `Found ${Object.keys(domainUuidToIdMap).length} domains for relation mapping`
      );

      // Update users with domain relations
      const transformedUsersWithDomainRelations = transformedUsersWithRelations.map(
        (strapiUser) => {
          const userWithDomains: any = { ...strapiUser };

          // Map domain access UUIDs to IDs
          if (strapiUser._domainAccessUuids && strapiUser._domainAccessUuids.length > 0) {
            const domainAccessIds = strapiUser._domainAccessUuids
              .map((uuid) => domainUuidToIdMap[uuid])
              .filter((id) => id); // Remove undefined IDs

            if (domainAccessIds.length > 0) {
              userWithDomains.domain_access = domainAccessIds;
            }
          }

          // Map domain admin UUIDs to IDs
          if (strapiUser._domainAdminUuids && strapiUser._domainAdminUuids.length > 0) {
            const domainAdminIds = strapiUser._domainAdminUuids
              .map((uuid) => domainUuidToIdMap[uuid])
              .filter((id) => id); // Remove undefined IDs

            if (domainAdminIds.length > 0) {
              userWithDomains.domain_admin = domainAdminIds;
            }
          }

          // Remove temporary UUID arrays
          delete userWithDomains._domainAccessUuids;
          delete userWithDomains._domainAdminUuids;

          return userWithDomains;
        }
      );

      strapi.log.info(
        `Updated ${transformedUsersWithDomainRelations.length} user-admin entries with domain relationships`
      );

      // Import the transformed data with relationships using the existing service
      const result = await strapi
        .plugin('import-content-type')
        .service('service')
        .importData(contentType, transformedUsersWithDomainRelations);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000 / 60;

      return ctx.send({
        success: true,
        message: `Successfully imported Drupal users into ${contentType} and created admin users`,
        sourceUrl: 'https://bjp.org/user-export-strapi',
        fetchedCount: drupalUsers.length,
        processedCount: drupalUsers.length,
        transformedCount: transformedUsersWithDomainRelations.length,
        contentTypeResult: result,
        adminUsers: {
          created: adminUsersCreated.length,
          errors: adminUsersErrors.length,
          createdUsers: adminUsersCreated,
          errorDetails: adminUsersErrors,
        },
        duration: `${duration.toFixed(2)} minutes`,
      });
    } catch (error) {
      strapi.log.error(`importDrupalUserInStrapi error: ${error.message}`);

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return ctx.badRequest(`Unable to connect to Drupal API: ${error.message}`);
      }

      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;

        if (status === 403) {
          return ctx.badRequest(
            `Access forbidden (403): The Drupal API endpoint 'https://bjp.org/user-export-strapi' requires authentication or proper permissions. Please contact the Drupal site administrator to get access credentials or check if the endpoint is publicly accessible.`
          );
        } else if (status === 401) {
          return ctx.badRequest(
            `Unauthorized (401): Invalid authentication credentials for the Drupal API.`
          );
        } else if (status === 404) {
          return ctx.badRequest(
            `Not found (404): The Drupal endpoint 'https://bjp.org/user-export-strapi' does not exist. Please verify the URL is correct.`
          );
        } else if (status === 500) {
          return ctx.badRequest(
            `Server error (500): The Drupal server encountered an internal error. Please try again later or contact the administrator.`
          );
        } else {
          return ctx.badRequest(
            `Drupal API error (${status}): ${statusText}. Please check the Drupal endpoint and try again.`
          );
        }
      }

      return ctx.badRequest(error.message || 'Error importing Drupal users');
    }
  },

  /**
   * Import domain data from BJP API into domain content type
   * @param ctx Koa context
   */
  async importBjpDomains(ctx) {
    try {
      const startTime = Date.now();
      strapi.log.info('Starting BJP domains import from https://bjp.org/custom/domain-list');

      // Fetch data from BJP API
      const agent = new https.Agent({
        rejectUnauthorized: false, // Allow self-signed certificates
      });

      const response = await axios.get('https://bjp.org/custom/domain-list', {
        httpsAgent: agent,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Strapi-Import-Plugin/1.0',
        },
        timeout: 30000, // 30 seconds timeout
      });

      if (!response.data || !Array.isArray(response.data)) {
        return ctx.badRequest('Invalid response from BJP API - expected an array of domains');
      }

      const bjpDomains = response.data;
      strapi.log.info(`Fetched ${bjpDomains.length} domains from BJP API`);

      // Transform BJP domain data to match Strapi domain schema
      const transformedDomains = bjpDomains.map((bjpDomain) => {
        // Extract hostname without port for machine_name generation
        const hostnameWithoutPort = bjpDomain.hostname ? bjpDomain.hostname.split(':')[0] : '';

        // Generate machine_name from hostname if not provided
        const machineName =
          bjpDomain.machine_name ||
          hostnameWithoutPort.replace(/\./g, '_').replace(/-/g, '_').toLowerCase();

        return {
          hostname: bjpDomain.hostname || '',
          machine_name: machineName,
          name: bjpDomain.name || '',
          scheme: bjpDomain.scheme === 'https' ? 'https' : 'http', // Ensure valid enum value
          status: 'active', // Default to active
          weight: 1, // Default weight
          is_default: false, // Default to false
          test_server_response: true, // Default to true
          bjp_uuid: bjpDomain.uuid, // Store BJP UUID for relation matching
        };
      });

      strapi.log.info(`Transformed ${transformedDomains.length} domains for Strapi import`);

      // Import the transformed data using the existing service
      const result = await strapi
        .plugin('import-content-type')
        .service('service')
        .importData('domain', transformedDomains);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      return ctx.send({
        success: true,
        message: 'Successfully imported BJP domains into domain content type',
        sourceUrl: 'https://bjp.org/custom/domain-list',
        fetchedCount: bjpDomains.length,
        transformedCount: transformedDomains.length,
        result,
        duration: `${duration.toFixed(2)} seconds`,
      });
    } catch (error) {
      strapi.log.error(`importBjpDomains error: ${error.message}`);

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return ctx.badRequest(`Unable to connect to BJP API: ${error.message}`);
      }

      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;

        if (status === 403) {
          return ctx.badRequest(
            `Access forbidden (403): The BJP API endpoint requires authentication or proper permissions.`
          );
        } else if (status === 401) {
          return ctx.badRequest(
            `Unauthorized (401): Invalid authentication credentials for the BJP API.`
          );
        } else if (status === 404) {
          return ctx.badRequest(
            `Not found (404): The BJP endpoint 'https://bjp.org/custom/domain-list' does not exist.`
          );
        } else if (status === 500) {
          return ctx.badRequest(
            `Server error (500): The BJP server encountered an internal error. Please try again later.`
          );
        } else {
          return ctx.badRequest(
            `BJP API error (${status}): ${statusText}. Please check the endpoint and try again.`
          );
        }
      }

      return ctx.badRequest(error.message || 'Error importing BJP domains');
    }
  },

  /**
   * Complete BJP import - imports domains first, then users with domain relations
   * @param ctx Koa context
   */
  async importBjpComplete(ctx) {
    try {
      const startTime = Date.now();
      strapi.log.info('Starting complete BJP import (domains + users with relations)');

      // Get parameters from request body
      const {
        drupalUrl = 'https://bjp.org/user-export-strapi',
        domainUrl = 'https://bjp.org/custom/domain-list',
      } = ctx.request.body || {};

      const results = {
        domains: null,
        users: null,
        summary: {},
      };

      // Step 1: Import domains first
      strapi.log.info('Step 1: Importing domains...');
      try {
        // Create HTTPS agent to handle SSL issues
        const agent = new https.Agent({ rejectUnauthorized: false });

        // Fetch domains from BJP API
        const domainResponse = await axios.get(domainUrl, {
          httpsAgent: agent,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Strapi-Import-Plugin/1.0',
          },
          timeout: 30000,
        });

        if (!domainResponse.data || !Array.isArray(domainResponse.data)) {
          throw new Error('Invalid response from BJP domains API - expected an array');
        }

        const bjpDomains = domainResponse.data;
        strapi.log.info(`Fetched ${bjpDomains.length} domains from BJP API`);

        // Transform domain data
        const transformedDomains = bjpDomains.map((bjpDomain) => {
          const hostnameWithoutPort = bjpDomain.hostname ? bjpDomain.hostname.split(':')[0] : '';
          const machineName =
            bjpDomain.machine_name ||
            hostnameWithoutPort.replace(/\./g, '_').replace(/-/g, '_').toLowerCase();

          return {
            hostname: bjpDomain.hostname || '',
            machine_name: machineName,
            name: bjpDomain.name || '',
            scheme: bjpDomain.scheme === 'https' ? 'https' : 'http',
            status: 'active',
            weight: 1,
            is_default: false,
            test_server_response: true,
            bjp_uuid: bjpDomain.uuid,
          };
        });

        // Import domains
        const domainResult = await strapi
          .plugin('import-content-type')
          .service('service')
          .importData('domain', transformedDomains);

        results.domains = {
          fetchedCount: bjpDomains.length,
          transformedCount: transformedDomains.length,
          result: domainResult,
        };

        strapi.log.info(`Successfully imported ${transformedDomains.length} domains`);
      } catch (domainError) {
        strapi.log.error(`Domain import failed: ${domainError.message}`);
        return ctx.badRequest(`Domain import failed: ${domainError.message}`);
      }

      // Step 2: Import users with domain relations
      strapi.log.info('Step 2: Importing users with domain relations (with pagination)...');
      try {
        // Create HTTPS agent to handle SSL issues
        const agent = new https.Agent({ rejectUnauthorized: false });

        // Initialize pagination variables
        let currentPage = 0;
        let allDrupalUsers = [];
        let totalFetchedUsers = 0;
        let hasMorePages = true;

        // Fetch users page by page
        while (hasMorePages) {
          strapi.log.info(`Fetching users from page ${currentPage}...`);

          const pageUrl = `${drupalUrl}?page=${currentPage}`;

          try {
            const userResponse = await axios.get(pageUrl, {
              httpsAgent: agent,
              timeout: 30000,
            });

            let pageUsers = userResponse.data;

            if (!Array.isArray(pageUsers)) {
              throw new Error(
                `Invalid response from Drupal users API page ${currentPage} - expected an array`
              );
            }

            // Check if we got any users on this page (blank array means no more data)
            if (pageUsers.length === 0) {
              strapi.log.info(
                `Page ${currentPage} returned empty array. No more users available. Stopping pagination.`
              );
              hasMorePages = false;
              break;
            }

            strapi.log.info(`Fetched ${pageUsers.length} users from page ${currentPage}`);

            // Add users from this page to the total collection
            allDrupalUsers = allDrupalUsers.concat(pageUsers);
            totalFetchedUsers += pageUsers.length;

            // Move to next page
            currentPage++;

            // Add a small delay between requests to be respectful to the API
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (pageError) {
            strapi.log.error(`Error fetching page ${currentPage}: ${pageError.message}`);
            // Stop pagination on any error
            hasMorePages = false;
            break;
          }
        }

        const originalUserCount = allDrupalUsers.length;
        strapi.log.info(`Total users fetched across ${currentPage} pages: ${originalUserCount}`);

        if (originalUserCount === 0) {
          strapi.log.warn('No users found across all pages. Skipping user import.');
          results.users = {
            fetchedCount: 0,
            processedCount: 0,
            transformedCount: 0,
            result: { created: 0, updated: 0, errors: [] },
            adminUsers: {
              created: 0,
              errors: 0,
              createdUsers: [],
              errorDetails: [],
            },
            pagesProcessed: currentPage,
          };
        } else {
          // Transform user data (reuse the logic from importDrupalUserInStrapi)
          const transformedUsers = allDrupalUsers.map((drupalUser) => {
            const extractValue = (field, defaultValue = null) => {
              if (Array.isArray(field) && field.length > 0 && field[0].value !== undefined) {
                return field[0].value;
              }
              return defaultValue;
            };

            const extractDomainUuids = (field) => {
              if (Array.isArray(field)) {
                return field.map((item) => item.target_uuid).filter((uuid) => uuid);
              }
              return [];
            };

            const uid = extractValue(drupalUser.uid);
            const username = extractValue(drupalUser.name);
            const email = extractValue(drupalUser.mail);
            const fullName = extractValue(drupalUser.field_full_name);
            const mobileNumber = extractValue(drupalUser.field_mobile_number);
            const pimUserId = extractValue(drupalUser.field_pim_user_id);
            const uuid = extractValue(drupalUser.uuid);
            const domainAccessUuids = extractDomainUuids(drupalUser.field_domain_access);
            const domainAdminUuids = extractDomainUuids(drupalUser.field_domain_admin);

            const strapiUser = {
              username: username || email,
              full_name: fullName,
              email_address: username,
              mobile_number: mobileNumber ? parseInt(mobileNumber, 10) : null,
              pim_User_id: pimUserId,
              drupal_id: uuid,
              google_analytics_settings: true,
              _domainAccessUuids: domainAccessUuids,
              _domainAdminUuids: domainAdminUuids,
            };

            Object.keys(strapiUser).forEach((key) => {
              if (strapiUser[key] === null || strapiUser[key] === undefined) {
                delete strapiUser[key];
              }
            });

            return strapiUser;
          });

          // Create admin users (reuse logic from importDrupalUserInStrapi)
          const adminUsersCreated = [];
          const adminUsersErrors = [];

          const extractValue = (field, defaultValue = null) => {
            if (Array.isArray(field) && field.length > 0 && field[0].value !== undefined) {
              return field[0].value;
            }
            return defaultValue;
          };

          for (const drupalUser of allDrupalUsers) {
            try {
              const username = extractValue(drupalUser.name);
              const email = extractValue(drupalUser.mail);
              const fullName = extractValue(drupalUser.field_full_name);
              const uuid = extractValue(drupalUser.uuid);
              const status = extractValue(drupalUser.status, true);
              const langcode = extractValue(drupalUser.langcode, 'en');

              if (!username || !email) {
                strapi.log.warn(
                  `Skipping user creation - missing username or email for UUID: ${uuid}`
                );
                continue;
              }

              const nameParts = fullName ? fullName.trim().split(' ') : [];
              const firstName = nameParts[0] || username || 'Unknown';
              const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

              const existingUser = await strapi.db.query('admin::user').findOne({
                where: {
                  $or: [{ username: username }, { email: email }],
                },
              });

              if (existingUser) {
                strapi.log.info(`Admin user already exists: ${username} (${email})`);
                adminUsersCreated.push({
                  id: existingUser.id,
                  username: existingUser.username,
                  email: existingUser.email,
                  drupalUuid: uuid,
                  isExisting: true,
                });
                continue;
              }

              const adminUserData = {
                firstname: firstName,
                lastname: lastName,
                username: username,
                email: email,
                isActive: status,
                blocked: !status,
                preferedLanguage: langcode,
              };

              const createdAdminUser = await strapi.db.query('admin::user').create({
                data: adminUserData,
              });

              adminUsersCreated.push({
                id: createdAdminUser.id,
                username: createdAdminUser.username,
                email: createdAdminUser.email,
                drupalUuid: uuid,
                isExisting: false,
              });

              strapi.log.info(
                `Created admin user: ${createdAdminUser.username} (ID: ${createdAdminUser.id})`
              );
            } catch (adminError) {
              const username = extractValue(drupalUser.name);
              const email = extractValue(drupalUser.mail);
              const identifier = username || email || 'unknown';

              strapi.log.error(`Error creating admin user ${identifier}: ${adminError.message}`);
              adminUsersErrors.push({
                identifier,
                error: adminError.message,
              });
            }
          }

          // Add admin user relationships
          const transformedUsersWithAdminRelations = transformedUsers.map((strapiUser) => {
            const matchingAdminUser = adminUsersCreated.find(
              (adminUser) => adminUser.drupalUuid === strapiUser.drupal_id
            );

            if (matchingAdminUser) {
              return {
                ...strapiUser,
                admin_user: matchingAdminUser.id,
              };
            }

            return strapiUser;
          });

          // Resolve domain relations
          strapi.log.info('Resolving domain relations...');

          const allDomains = await strapi.entityService.findMany('api::domain.domain', {
            fields: ['id', 'bjp_uuid'],
            limit: -1,
          });

          const domainUuidToIdMap = {};
          allDomains.forEach((domain) => {
            if (domain.bjp_uuid) {
              domainUuidToIdMap[domain.bjp_uuid] = domain.id;
            }
          });

          strapi.log.info(
            `Found ${Object.keys(domainUuidToIdMap).length} domains for relation mapping`
          );

          const transformedUsersWithDomainRelations = transformedUsersWithAdminRelations.map(
            (strapiUser) => {
              const userWithDomains: any = { ...strapiUser };

              if (strapiUser._domainAccessUuids && strapiUser._domainAccessUuids.length > 0) {
                const domainAccessIds = strapiUser._domainAccessUuids
                  .map((uuid) => domainUuidToIdMap[uuid])
                  .filter((id) => id);

                if (domainAccessIds.length > 0) {
                  userWithDomains.domain_access = domainAccessIds;
                }
              }

              if (strapiUser._domainAdminUuids && strapiUser._domainAdminUuids.length > 0) {
                const domainAdminIds = strapiUser._domainAdminUuids
                  .map((uuid) => domainUuidToIdMap[uuid])
                  .filter((id) => id);

                if (domainAdminIds.length > 0) {
                  userWithDomains.domain_admin = domainAdminIds;
                }
              }

              delete userWithDomains._domainAccessUuids;
              delete userWithDomains._domainAdminUuids;

              return userWithDomains;
            }
          );

          // Import users with all relations
          const userResult = await strapi
            .plugin('import-content-type')
            .service('service')
            .importData('user-admin', transformedUsersWithDomainRelations);

          results.users = {
            fetchedCount: originalUserCount,
            processedCount: allDrupalUsers.length,
            transformedCount: transformedUsersWithDomainRelations.length,
            result: userResult,
            adminUsers: {
              created: adminUsersCreated.length,
              errors: adminUsersErrors.length,
              createdUsers: adminUsersCreated,
              errorDetails: adminUsersErrors,
            },
            pagesProcessed: currentPage,
          };

          strapi.log.info(
            `Successfully imported ${transformedUsersWithDomainRelations.length} users with domain relations from ${currentPage} pages (${originalUserCount} total fetched)`
          );
        }
      } catch (userError) {
        strapi.log.error(`User import failed: ${userError.message}`);
        return ctx.badRequest(`User import failed: ${userError.message}`);
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      results.summary = {
        totalDuration: `${duration.toFixed(2)} seconds`,
        domainsImported: results.domains?.result?.created || 0,
        usersImported: results.users?.result?.created || 0,
        adminUsersCreated: results.users?.adminUsers?.created || 0,
        pagesProcessed: results.users?.pagesProcessed || 0,
      };

      return ctx.send({
        success: true,
        message: 'Successfully completed BJP import (domains + users with relations)',
        results,
      });
    } catch (error) {
      strapi.log.error(`importBjpComplete error: ${error.message}`);
      return ctx.badRequest(error.message || 'Error during complete BJP import');
    }
  },
});

export default controller;
