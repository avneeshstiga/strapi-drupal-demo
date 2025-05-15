export default () => ({
  "import-content-type": {
    enabled: true,
    resolve: "./src/plugins/import-content-type",
    config: {
      // Get token from environment or use empty string if not available
      uploadToken: process.env.STRAPI_UPLOAD_TOKEN || "",
    },
  },
});
