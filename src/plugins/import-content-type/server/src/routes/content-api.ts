export default [
  {
    method: 'GET',
    path: '/',
    // name of the controller file & the method.
    handler: 'controller.index',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/import/:contentType',
    handler: 'controller.importData',
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'POST',
    path: '/import-json/:contentType',
    handler: 'controller.importJsonData',
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'POST',
    path: '/upload-file/:contentType',
    handler: 'controller.handleFileUpload',
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'POST',
    path: '/import-local-file/:contentType',
    handler: 'controller.importFromLocalFile',
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
];
