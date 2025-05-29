import path from 'path';
import fs from 'fs-extra';

export const createErrorFiles = async (result, name, includedResult = []) => {
  let filePath = null;
  if (result?.errors?.length > 0 || result?.failedRecords?.length > 0) {
    try {
      // Create a temporary file with date-based directory structure
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const timeStr = now.toISOString().replace(/:/g, '-').replace(/\..+/, ''); // YYYY-MM-DDThh-mm-ss format

      // Create base logs directory
      const baseLogDir = path.join(__dirname, 'project-logs');
      // Create date-specific directory
      const dateDir = path.join(baseLogDir, dateStr);

      // Ensure tmp dir exists
      await fs.ensureDir(baseLogDir);
      await fs.ensureDir(dateDir);

      if (result.errors.length > 0) {
        // Create unique filename with timestamp
        const logFileName = `${name}-errors-${timeStr}.json`;
        filePath = path.join(dateDir, logFileName);

        fs.writeFileSync(filePath, JSON.stringify({ data: result.errors }, null, 2));
        strapi.log.info(`Created errors log file at ${filePath}`);
      }

      if (result.failedRecords.length > 0) {
        const logFileName = `${name}-failed-records-${timeStr}.json`;
        filePath = path.join(dateDir, logFileName);

        fs.writeFileSync(
          filePath,
          JSON.stringify({ data: result.failedRecords, included: includedResult }, null, 2)
        );
        strapi.log.info(`Created failed records log file at ${filePath}`);
      }
    } catch (error) {
      strapi.log.error(`Error creating logs directory for ${name}: ${error.message}`);
    }
  }
};
