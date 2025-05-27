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
  {
    method: 'POST',
    path: '/import-v2/:contentType',
    handler: 'importV2Controller.importData',
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'POST',
    path: '/fetch-drupal',
    handler: 'controller.fetchDrupalData',
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'DELETE',
    path: '/delete/:contentType',
    handler: 'controller.deleteContentType',
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'POST',
    path: '/import-drupal-user-in-strapi',
    handler: 'controller.importDrupalUserInStrapi', //http://localhost:1337/api/import-content-type/import-drupal-user-in-strapi
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'POST',
    path: '/import-bjp-domains',
    handler: 'controller.importBjpDomains', //http://localhost:1337/api/import-content-type/import-bjp-domains
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'POST',
    path: '/import-bjp-complete',
    handler: 'controller.importBjpComplete', //http://localhost:1337/api/import-content-type/import-bjp-complete
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
  {
    method: 'DELETE',
    path: '/delete-all-users',
    handler: 'controller.deleteAllUsers', //http://localhost:1337/api/import-content-type/delete-all-users
    config: {
      policies: [],
      auth: false, // Make this endpoint public
    },
  },
];
