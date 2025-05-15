export default {
  default: {
    uploadToken: process.env.STRAPI_UPLOAD_TOKEN || '',
  },
  validator(config) {
    // Optional validation
    if (config.uploadToken && typeof config.uploadToken !== 'string') {
      throw new Error('Config property uploadToken must be a string');
    }
  },
};
