import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['en', 'de'], // Enable English and German
    translations: {
      en: {
        'Auth.form.email.label': 'Email address',
        Users: 'Users',
        City: 'City',
        Id: 'ID',
      },
      de: {
        'Auth.form.email.label': 'E-Mail-Adresse',
        Users: 'Benutzer',
        City: 'Stadt',
        Id: 'ID',
      },
    },
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
