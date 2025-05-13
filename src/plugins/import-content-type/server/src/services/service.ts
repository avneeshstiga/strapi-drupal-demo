import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
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
          // Create entry in the specified content type
          await strapi.entityService.create(`api::${contentType}.${contentType}`, {
            data: record,
          });
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            index: recordIndex,
            message: error.message || 'Unknown error',
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
