import { Core } from '@strapi/strapi';
import { fetchAll } from './getData';

const importV2Controller = ({ strapi }: { strapi: Core.Strapi }) => ({
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
      const url = 'https://bjp.org/jsonapi/taxonomy_term/ac_type';
      const data = await fetchAll(url);

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
});

export default importV2Controller;
