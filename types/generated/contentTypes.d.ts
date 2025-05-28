import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAcTypeAcType extends Struct.CollectionTypeSchema {
  collectionName: 'ac_types';
  info: {
    description: '';
    displayName: 'AC Type';
    pluralName: 'ac-types';
    singularName: 'ac-type';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ac-type.ac-type'
    >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    state: Schema.Attribute.Relation<'manyToOne', 'api::state.state'>;
    state_highlight: Schema.Attribute.String;
    taxonomy_pim_id: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiArticleTypeArticleType extends Struct.CollectionTypeSchema {
  collectionName: 'article_types';
  info: {
    description: '';
    displayName: 'Article Type';
    pluralName: 'article-types';
    singularName: 'article-type';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::article-type.article-type'
    >;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    taxonomy_pim_id: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiBjpGovernedStateBjpGovernedState
  extends Struct.CollectionTypeSchema {
  collectionName: 'bjp_governed_states';
  info: {
    description: '';
    displayName: 'BJP Governed States';
    pluralName: 'bjp-governed-states';
    singularName: 'bjp-governed-state';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    bjp_governed_state_images: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    domain_url: Schema.Attribute.String;
    drupal_id: Schema.Attribute.String;
    historical_monuments: Schema.Attribute.Media<'images' | 'files'>;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::bjp-governed-state.bjp-governed-state'
    >;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    state_highlight: Schema.Attribute.String & Schema.Attribute.Required;
    state_website_home_logo: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    state_website_home_logo_hi: Schema.Attribute.Media<'images' | 'files'>;
    state_website_inner_logo: Schema.Attribute.Media<'images' | 'files'>;
    state_website_inner_logo_h: Schema.Attribute.Media<'images' | 'files'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
    welcome_message_state_home: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface ApiBjpLiveTagBjpLiveTag extends Struct.CollectionTypeSchema {
  collectionName: 'bjp_live_tags';
  info: {
    description: '';
    displayName: 'BJP Live Tags';
    pluralName: 'bjp-live-tags';
    singularName: 'bjp-live-tag';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::bjp-live-tag.bjp-live-tag'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiBudgetGlanceTypeBudgetGlanceType
  extends Struct.CollectionTypeSchema {
  collectionName: 'budget_glance_types';
  info: {
    description: '';
    displayName: 'Budget Glance Type';
    pluralName: 'budget-glance-types';
    singularName: 'budget-glance-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::budget-glance-type.budget-glance-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiCampaignMaterialsPhotoTypeCampaignMaterialsPhotoType
  extends Struct.CollectionTypeSchema {
  collectionName: 'campaign_materials_photo_types';
  info: {
    displayName: 'Campaign Materials Photo Types';
    pluralName: 'campaign-materials-photo-types';
    singularName: 'campaign-materials-photo-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::campaign-materials-photo-type.campaign-materials-photo-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiCampaignMaterialsStatePhotoTypeCampaignMaterialsStatePhotoType
  extends Struct.CollectionTypeSchema {
  collectionName: 'campaign_materials_state_photo_types';
  info: {
    displayName: 'Campaign Materials State Photo Types';
    pluralName: 'campaign-materials-state-photo-types';
    singularName: 'campaign-materials-state-photo-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::campaign-materials-state-photo-type.campaign-materials-state-photo-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiCampaignMaterialsStateVideoTypeCampaignMaterialsStateVideoType
  extends Struct.CollectionTypeSchema {
  collectionName: 'campaign_materials_state_video_types';
  info: {
    displayName: 'Campaign Materials State Video Types';
    pluralName: 'campaign-materials-state-video-types';
    singularName: 'campaign-materials-state-video-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::campaign-materials-state-video-type.campaign-materials-state-video-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiCampaignMaterialsVideoTypeCampaignMaterialsVideoType
  extends Struct.CollectionTypeSchema {
  collectionName: 'campaign_materials_video_types';
  info: {
    description: '';
    displayName: 'Campaign Materials Video Types';
    pluralName: 'campaign-materials-video-types';
    singularName: 'campaign-materials-video-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::campaign-materials-video-type.campaign-materials-video-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiCommitteeCommittee extends Struct.CollectionTypeSchema {
  collectionName: 'committees';
  info: {
    displayName: 'Committees';
    pluralName: 'committees';
    singularName: 'committee';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::committee.committee'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiCommitteesDesignationCommitteesDesignation
  extends Struct.CollectionTypeSchema {
  collectionName: 'committees_designations';
  info: {
    displayName: 'Committees Designation';
    pluralName: 'committees-designations';
    singularName: 'committees-designation';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::committees-designation.committees-designation'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    taxonomy_pim_id: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiCommonYearMasterCommonYearMaster
  extends Struct.CollectionTypeSchema {
  collectionName: 'common_year_masters';
  info: {
    displayName: 'Common Year Master';
    pluralName: 'common-year-masters';
    singularName: 'common-year-master';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::common-year-master.common-year-master'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    taxonomy_pim_id: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiDelhiDistrictDelhiDistrict
  extends Struct.CollectionTypeSchema {
  collectionName: 'delhi_districts';
  info: {
    displayName: 'Delhi Districts';
    pluralName: 'delhi-districts';
    singularName: 'delhi-district';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::delhi-district.delhi-district'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiDepartmentTypeDepartmentType
  extends Struct.CollectionTypeSchema {
  collectionName: 'department_types';
  info: {
    displayName: 'Department Type';
    pluralName: 'department-types';
    singularName: 'department-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    departnments_image: Schema.Attribute.Media<'images' | 'files'>;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::department-type.department-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiDesignationDesignation extends Struct.CollectionTypeSchema {
  collectionName: 'designations';
  info: {
    description: 'Designation taxonomy structure';
    displayName: 'Designation';
    pluralName: 'designations';
    singularName: 'designation';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::designation.designation'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiDomainDomain extends Struct.CollectionTypeSchema {
  collectionName: 'domains';
  info: {
    description: 'Domain configuration for multi-site management';
    displayName: 'Domain';
    pluralName: 'domains';
    singularName: 'domain';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    bjp_uuid: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    hostname: Schema.Attribute.String & Schema.Attribute.Required;
    is_default: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::domain.domain'
    > &
      Schema.Attribute.Private;
    machine_name: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    scheme: Schema.Attribute.Enumeration<['http', 'https', 'variable']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'http'>;
    status: Schema.Attribute.Enumeration<['active', 'inactive']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'active'>;
    test_server_response: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user_access: Schema.Attribute.Relation<
      'manyToMany',
      'api::user-admin.user-admin'
    >;
    user_admin: Schema.Attribute.Relation<
      'manyToMany',
      'api::user-admin.user-admin'
    >;
    weight: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 999;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
  };
}

export interface ApiElectionFormatTypeElectionFormatType
  extends Struct.CollectionTypeSchema {
  collectionName: 'election_format_types';
  info: {
    displayName: 'Election Format Type';
    pluralName: 'election-format-types';
    singularName: 'election-format-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::election-format-type.election-format-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiElectionStateElectionState
  extends Struct.CollectionTypeSchema {
  collectionName: 'election_states';
  info: {
    displayName: 'Election States';
    pluralName: 'election-states';
    singularName: 'election-state';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::election-state.election-state'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiGlobalGlobal extends Struct.SingleTypeSchema {
  collectionName: 'globals';
  info: {
    description: 'Define global settings';
    displayName: 'Global';
    pluralName: 'globals';
    singularName: 'global';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    defaultSeo: Schema.Attribute.Component<'shared.seo', false>;
    favicon: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::global.global'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    siteDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    siteName: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiHistoryOfThePartyYearHistoryOfThePartyYear
  extends Struct.CollectionTypeSchema {
  collectionName: 'history_of_the_party_years';
  info: {
    description: '';
    displayName: 'History of the party Year';
    pluralName: 'history-of-the-party-years';
    singularName: 'history-of-the-party-year';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::history-of-the-party-year.history-of-the-party-year'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
  };
}

export interface ApiInfographicTypeInfographicType
  extends Struct.CollectionTypeSchema {
  collectionName: 'infographic_types';
  info: {
    description: 'Infographic categories imported from Drupal';
    displayName: 'Infographic Type';
    pluralName: 'infographic-types';
    singularName: 'infographic-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    field_redirect_url: Schema.Attribute.String;
    field_taxonomy_pim_id: Schema.Attribute.String;
    infographics_images: Schema.Attribute.Media<undefined, true>;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::infographic-type.infographic-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    photography_infography_image: Schema.Attribute.Media;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiInterestInterest extends Struct.CollectionTypeSchema {
  collectionName: 'interests';
  info: {
    description: '';
    displayName: 'interest';
    pluralName: 'interests';
    singularName: 'interest';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    drupal_id: Schema.Attribute.String;
    interested_gender: Schema.Attribute.String & Schema.Attribute.Required;
    Interested_topic: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::interest.interest'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiJourneyYearJourneyYear extends Struct.CollectionTypeSchema {
  collectionName: 'journey_years';
  info: {
    description: 'Year values used in the BJP Journey taxonomy';
    displayName: 'Journey Year';
    pluralName: 'journey-years';
    singularName: 'journey-year';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::journey-year.journey-year'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiLanguageLanguage extends Struct.CollectionTypeSchema {
  collectionName: 'languages';
  info: {
    description: '';
    displayName: 'Language';
    pluralName: 'languages';
    singularName: 'language';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    booksmonograph_langode: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::language.language'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiLeaderTypeLeaderType extends Struct.CollectionTypeSchema {
  collectionName: 'leader_types';
  info: {
    description: 'Leader classification from Drupal';
    displayName: 'Leader Type';
    pluralName: 'leader-types';
    singularName: 'leader-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::leader-type.leader-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiLeadersTypeLeadersType extends Struct.CollectionTypeSchema {
  collectionName: 'leaders_types';
  info: {
    description: 'Categorization of political leadership roles';
    displayName: 'Leaders Type';
    pluralName: 'leaders-types';
    singularName: 'leaders-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::leaders-type.leaders-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiLeadersLeaders extends Struct.CollectionTypeSchema {
  collectionName: 'leaders';
  info: {
    description: 'Imported from Drupal 8: leaders';
    displayName: 'Leaders';
    drupalEndpoint: 'leaders';
    pluralName: 'leaderss';
    singularName: 'leaders';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article_archive: Schema.Attribute.JSON;
    background_image_color: Schema.Attribute.String;
    body: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date_of_birth: Schema.Attribute.String;
    date_of_death: Schema.Attribute.String;
    default_langcode: Schema.Attribute.Boolean;
    domain_all_affiliates: Schema.Attribute.Boolean;
    drupal_id: Schema.Attribute.String & Schema.Attribute.Unique;
    duration: Schema.Attribute.JSON;
    election_corner_leader_ext: Schema.Attribute.String;
    email: Schema.Attribute.String;
    email_id: Schema.Attribute.JSON;
    ios_app_link: Schema.Attribute.String;
    is_alive: Schema.Attribute.String;
    leader_address: Schema.Attribute.JSON;
    leader_banner_caption: Schema.Attribute.String;
    leader_contact_no: Schema.Attribute.JSON;
    leader_facebook: Schema.Attribute.String;
    leader_instagram: Schema.Attribute.String;
    leader_mobile_app: Schema.Attribute.String;
    leader_twitter: Schema.Attribute.String;
    leader_website: Schema.Attribute.String;
    leader_youtube: Schema.Attribute.String;
    leaders_is_mp: Schema.Attribute.String;
    leaders_shorten_link: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::leaders.leaders'
    > &
      Schema.Attribute.Private;
    lok_sabha_and_rajya_sabha: Schema.Attribute.String;
    meta_tags: Schema.Attribute.String;
    node_pim_id: Schema.Attribute.String;
    parliamentary_twitter: Schema.Attribute.String;
    promote: Schema.Attribute.Boolean;
    published: Schema.Attribute.Boolean;
    publishedAt: Schema.Attribute.DateTime;
    sticky: Schema.Attribute.Boolean;
    sub_title: Schema.Attribute.String;
    template_selection_option: Schema.Attribute.String;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    weight: Schema.Attribute.Integer;
  };
}

export interface ApiLokSabhaStateAndPcListingLokSabhaStateAndPcListing
  extends Struct.CollectionTypeSchema {
  collectionName: 'lok_sabha_state_and_pc_listings';
  info: {
    description: 'State and Parliamentary Constituency listing (Lok Sabha)';
    displayName: 'Lok Sabha State and PC Listing';
    pluralName: 'lok-sabha-state-and-pc-listings';
    singularName: 'lok-sabha-state-and-pc-listing';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::lok-sabha-state-and-pc-listing.lok-sabha-state-and-pc-listing'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiLoksabhamemberLoksabhamember
  extends Struct.CollectionTypeSchema {
  collectionName: 'loksabhamembers';
  info: {
    description: '';
    displayName: 'Loksabhamember';
    pluralName: 'loksabhamembers';
    singularName: 'loksabhamember';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::loksabhamember.loksabhamember'
    > &
      Schema.Attribute.Private;
    member_name: Schema.Attribute.String;
    member_pic: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    member_seat: Schema.Attribute.String;
    member_seat_state: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiManifestoLanguageManifestoLanguage
  extends Struct.CollectionTypeSchema {
  collectionName: 'manifesto_languages';
  info: {
    description: 'Languages available for manifestos';
    displayName: 'Manifesto Language';
    pluralName: 'manifesto-languages';
    singularName: 'manifesto-language';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::manifesto-language.manifesto-language'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiMemberTypeMemberType extends Struct.CollectionTypeSchema {
  collectionName: 'member_types';
  info: {
    description: 'Drupal taxonomy: Member Type';
    displayName: 'Member Type';
    pluralName: 'member-types';
    singularName: 'member-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::member-type.member-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiMicrositeInforgarphicTypeMicrositeInforgarphicType
  extends Struct.CollectionTypeSchema {
  collectionName: 'microsite_inforgarphic_types';
  info: {
    description: 'Taxonomy for microsite infographic categories';
    displayName: 'Microsite Infographic Type';
    pluralName: 'microsite-inforgarphic-types';
    singularName: 'microsite-inforgarphic-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    field_microsite_category_image: Schema.Attribute.Media;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::microsite-inforgarphic-type.microsite-inforgarphic-type'
    > &
      Schema.Attribute.Private;
    metatag: Schema.Attribute.JSON;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiMinisterTypeMinisterType
  extends Struct.CollectionTypeSchema {
  collectionName: 'minister_types';
  info: {
    description: 'Taxonomy to categorize types of ministers';
    displayName: 'Minister Type';
    pluralName: 'minister-types';
    singularName: 'minister-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::minister-type.minister-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiMinistryMinistry extends Struct.CollectionTypeSchema {
  collectionName: 'ministries';
  info: {
    description: 'Government ministries taxonomy';
    displayName: 'Ministry';
    pluralName: 'ministries';
    singularName: 'ministry';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ministry.ministry'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiMonthMonth extends Struct.CollectionTypeSchema {
  collectionName: 'months';
  info: {
    description: 'Taxonomy for calendar months';
    displayName: 'Month';
    pluralName: 'months';
    singularName: 'month';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    field_taxonomy_pim_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::month.month'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiMorchaTypeMorchaType extends Struct.CollectionTypeSchema {
  collectionName: 'morcha_types';
  info: {
    description: 'Types of Morcha such as Kisan Morcha';
    displayName: 'Morcha Type';
    pluralName: 'morcha-types';
    singularName: 'morcha-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::morcha-type.morcha-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiNationalExecutiveCategoryNationalExecutiveCategory
  extends Struct.CollectionTypeSchema {
  collectionName: 'national_executive_categories';
  info: {
    description: 'Taxonomy for types of national executive content';
    displayName: 'National Executive Category';
    pluralName: 'national-executive-categories';
    singularName: 'national-executive-category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::national-executive-category.national-executive-category'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiNationalExecutiveYearNationalExecutiveYear
  extends Struct.CollectionTypeSchema {
  collectionName: 'national_executive_years';
  info: {
    description: 'Yearly taxonomy for National Executive Events';
    displayName: 'National Executive Year';
    pluralName: 'national-executive-years';
    singularName: 'national-executive-year';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::national-executive-year.national-executive-year'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiNationalGeneralSecretaryCategNationalGeneralSecretaryCateg
  extends Struct.CollectionTypeSchema {
  collectionName: 'national_general_secretary_categs';
  info: {
    description: 'National General Secretary Category taxonomy';
    displayName: 'National General Secretary Categ';
    pluralName: 'national-general-secretary-categs';
    singularName: 'national-general-secretary-categ';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::national-general-secretary-categ.national-general-secretary-categ'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiOrganisationDesignationOrganisationDesignation
  extends Struct.CollectionTypeSchema {
  collectionName: 'organisation_designations';
  info: {
    description: 'Organisation Designation similar to Drupal taxonomy';
    displayName: 'Organisation Designation';
    pluralName: 'organisation-designations';
    singularName: 'organisation-designation';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::organisation-designation.organisation-designation'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiParliamentaryBoardDesignationParliamentaryBoardDesignation
  extends Struct.CollectionTypeSchema {
  collectionName: 'parliamentary_board_designations';
  info: {
    description: 'Designations of individuals in the Parliamentary Board (e.g., Prime Minister)';
    displayName: 'Parliamentary Board Designation';
    pluralName: 'parliamentary-board-designations';
    singularName: 'parliamentary-board-designation';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::parliamentary-board-designation.parliamentary-board-designation'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiPcTypePcType extends Struct.CollectionTypeSchema {
  collectionName: 'pc_types';
  info: {
    description: 'Parliamentary constituency types with optional state reference';
    displayName: 'PC Type';
    pluralName: 'pc-types';
    singularName: 'pc-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    field_pc_type_states: Schema.Attribute.Relation<
      'manyToOne',
      'api::state.state'
    >;
    field_taxonomy_pim_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::pc-type.pc-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiPhaseTypePhaseType extends Struct.CollectionTypeSchema {
  collectionName: 'phase_types';
  info: {
    description: 'Election or campaign phase types (e.g., Phase 1, Phase 2)';
    displayName: 'Phase Type';
    pluralName: 'phase-types';
    singularName: 'phase-type';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    description: Schema.Attribute.Blocks &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::phase-type.phase-type'
    >;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String &
      Schema.Attribute.Unique &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface ApiPhotoGalleryTypePhotoGalleryType
  extends Struct.CollectionTypeSchema {
  collectionName: 'photo_gallery_types';
  info: {
    description: 'Categories for photo galleries (e.g. Events, Campaigns)';
    displayName: 'Photo Gallery Type';
    pluralName: 'photo-gallery-types';
    singularName: 'photo-gallery-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    field_taxonomy_pim_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::photo-gallery-type.photo-gallery-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiPhotoGalleryPhotoGallery
  extends Struct.CollectionTypeSchema {
  collectionName: 'photo_gallery';
  info: {
    description: 'Imported from Drupal 8: photo_gallery';
    displayName: 'Photo Gallery';
    drupalEndpoint: 'photo_gallery';
    pluralName: 'photo-gallerys';
    singularName: 'photo-gallery';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    archive_article: Schema.Attribute.Boolean;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date_photo_gallery: Schema.Attribute.String;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    domain_all_affiliates: Schema.Attribute.Boolean;
    drupal_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    leader: Schema.Attribute.Relation<'oneToMany', 'api::leaders.leaders'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::photo-gallery.photo-gallery'
    > &
      Schema.Attribute.Private;
    meta_tags: Schema.Attribute.String;
    name: Schema.Attribute.String;
    node_joomla_id: Schema.Attribute.String;
    node_pim_id: Schema.Attribute.String;
    photo_gallery_order: Schema.Attribute.Integer;
    photo_gallery_url: Schema.Attribute.String;
    photo_latest_on_banner: Schema.Attribute.JSON;
    photo_shorten_link: Schema.Attribute.String;
    promote: Schema.Attribute.Boolean;
    published: Schema.Attribute.Boolean;
    publishedAt: Schema.Attribute.DateTime;
    sticky: Schema.Attribute.Boolean;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPressReleasesPressReleases
  extends Struct.CollectionTypeSchema {
  collectionName: 'press_releases';
  info: {
    description: 'Imported from Drupal 8: press_releases';
    displayName: 'Press Releases';
    drupalEndpoint: 'press_releases';
    pluralName: 'press-releasess';
    singularName: 'press-releases';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    article_archive: Schema.Attribute.JSON;
    body: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date_press_releases: Schema.Attribute.String;
    default_langcode: Schema.Attribute.Boolean;
    domain_all_affiliates: Schema.Attribute.Boolean;
    drupal_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::press-releases.press-releases'
    > &
      Schema.Attribute.Private;
    media_title: Schema.Attribute.String;
    meta_tags: Schema.Attribute.String;
    node_joomla_id: Schema.Attribute.String;
    node_pim_id: Schema.Attribute.String;
    press_release_shorten_link: Schema.Attribute.String;
    press_releases_order: Schema.Attribute.Integer;
    pressrelease_upload_media: Schema.Attribute.String;
    promote: Schema.Attribute.Boolean;
    published: Schema.Attribute.Boolean;
    publishedAt: Schema.Attribute.DateTime;
    sticky: Schema.Attribute.Boolean;
    title: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRajyaSabhaStateListingRajyaSabhaStateListing
  extends Struct.CollectionTypeSchema {
  collectionName: 'rajya_sabha_state_listings';
  info: {
    description: 'List of Indian states used for Rajya Sabha member classification';
    displayName: 'Rajya Sabha State Listing';
    pluralName: 'rajya-sabha-state-listings';
    singularName: 'rajya-sabha-state-listing';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::rajya-sabha-state-listing.rajya-sabha-state-listing'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiReleaseTypeReleaseType extends Struct.CollectionTypeSchema {
  collectionName: 'release_types';
  info: {
    description: 'Types of releases (e.g., Foundation Day, press release types)';
    displayName: 'Release Type';
    pluralName: 'release-types';
    singularName: 'release-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    content_translation_source: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    field_taxonomy_pim_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::release-type.release-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSocialStreamTypeSocialStreamType
  extends Struct.CollectionTypeSchema {
  collectionName: 'social_stream_types';
  info: {
    description: 'Types of social media streams like Facebook, Twitter, etc.';
    displayName: 'Social Stream Type';
    pluralName: 'social-stream-types';
    singularName: 'social-stream-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    field_social_stream_icon: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::social-stream-type.social-stream-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiStateInfographicTypeStateInfographicType
  extends Struct.CollectionTypeSchema {
  collectionName: 'state_infographic_types';
  info: {
    description: 'Types of state-level infographics and their metadata';
    displayName: 'State Infographic Type';
    pluralName: 'state-infographic-types';
    singularName: 'state-infographic-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    changed: Schema.Attribute.BigInteger;
    content_translation_created: Schema.Attribute.BigInteger;
    content_translation_outdated: Schema.Attribute.Boolean;
    content_translation_source: Schema.Attribute.String;
    content_translation_uid: Schema.Attribute.UID;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_revision_id: Schema.Attribute.Integer;
    drupal_tid: Schema.Attribute.Integer & Schema.Attribute.Required;
    field_infographics_image: Schema.Attribute.Media<'images', true>;
    field_order: Schema.Attribute.Integer;
    field_photography_infography_img: Schema.Attribute.Media<'images'>;
    field_redirect_url: Schema.Attribute.String;
    field_taxonomy_pim_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::state-infographic-type.state-infographic-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    parent_virtual: Schema.Attribute.String;
    path_alias: Schema.Attribute.String;
    path_pid: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    revision_created: Schema.Attribute.BigInteger;
    revision_translation_affected: Schema.Attribute.Boolean;
    revision_user_id: Schema.Attribute.UID;
    status: Schema.Attribute.Boolean;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
    vid_id: Schema.Attribute.UID;
  };
}

export interface ApiStatePresidentsDesignationStatePresidentsDesignation
  extends Struct.CollectionTypeSchema {
  collectionName: 'state_presidents_designations';
  info: {
    description: 'Designation types for state presidents and similar roles';
    displayName: 'State Presidents Designation';
    pluralName: 'state-presidents-designations';
    singularName: 'state-presidents-designation';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    default_langcode: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    description: Schema.Attribute.Blocks &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::state-presidents-designation.state-presidents-designation'
    >;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String &
      Schema.Attribute.Unique &
      Schema.Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
  };
}

export interface ApiStateState extends Struct.CollectionTypeSchema {
  collectionName: 'states';
  info: {
    description: '';
    displayName: 'States';
    pluralName: 'states';
    singularName: 'state';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    ac_types: Schema.Attribute.Relation<'oneToMany', 'api::ac-type.ac-type'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    drupal_published: Schema.Attribute.Boolean;
    facebook_link: Schema.Attribute.JSON;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    linkedin_link: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::state.state'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    pim_id: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    twitter_link: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String;
    youtube_link: Schema.Attribute.JSON;
  };
}

export interface ApiTagTag extends Struct.CollectionTypeSchema {
  collectionName: 'tags';
  info: {
    description: '';
    displayName: 'Tags';
    pluralName: 'tags';
    singularName: 'tag';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::tag.tag'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiTimeDurationTimeDuration
  extends Struct.CollectionTypeSchema {
  collectionName: 'time_durations';
  info: {
    description: 'Time duration taxonomy from Drupal';
    displayName: 'Time Duration';
    pluralName: 'time-durations';
    singularName: 'time-duration';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::time-duration.time-duration'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiUnionBudgetYearUnionBudgetYear
  extends Struct.CollectionTypeSchema {
  collectionName: 'union_budget_years';
  info: {
    description: 'Union Budget Year taxonomy from Drupal';
    displayName: 'Union Budget Year';
    pluralName: 'union-budget-years';
    singularName: 'union-budget-year';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::union-budget-year.union-budget-year'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiUserAdminUserAdmin extends Struct.CollectionTypeSchema {
  collectionName: 'user_admins';
  info: {
    description: '';
    displayName: 'User Admin';
    pluralName: 'user-admins';
    singularName: 'user-admin';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    admin_user: Schema.Attribute.Relation<'oneToOne', 'admin::user'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    domain_access: Schema.Attribute.Relation<
      'manyToMany',
      'api::domain.domain'
    >;
    domain_admin: Schema.Attribute.Relation<'manyToMany', 'api::domain.domain'>;
    drupal_id: Schema.Attribute.String;
    email_address: Schema.Attribute.String;
    full_name: Schema.Attribute.String;
    google_analytics_settings: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-admin.user-admin'
    > &
      Schema.Attribute.Private;
    mobile_number: Schema.Attribute.BigInteger;
    picture: Schema.Attribute.Media<'images' | 'files', true>;
    pim_User_id: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    site_language: Schema.Attribute.Component<'shared.language', false>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiUttarPradeshDistrictUttarPradeshDistrict
  extends Struct.CollectionTypeSchema {
  collectionName: 'uttar_pradesh_districts';
  info: {
    description: 'District taxonomy from Drupal';
    displayName: 'Uttar Pradesh District';
    pluralName: 'uttar-pradesh-districts';
    singularName: 'uttar-pradesh-district';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::uttar-pradesh-district.uttar-pradesh-district'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    state: Schema.Attribute.Relation<'manyToOne', 'api::state.state'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface ApiVideoGalleryTypeVideoGalleryType
  extends Struct.CollectionTypeSchema {
  collectionName: 'video_gallery_types';
  info: {
    description: 'Video gallery taxonomy from Drupal';
    displayName: 'Video Gallery Type';
    pluralName: 'video-gallery-types';
    singularName: 'video-gallery-type';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks;
    drupal_id: Schema.Attribute.String;
    field_taxonomy_pim_id: Schema.Attribute.String;
    languages: Schema.Attribute.Relation<'oneToMany', 'api::language.language'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::video-gallery-type.video-gallery-type'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url_alias: Schema.Attribute.String & Schema.Attribute.Unique;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::ac-type.ac-type': ApiAcTypeAcType;
      'api::article-type.article-type': ApiArticleTypeArticleType;
      'api::bjp-governed-state.bjp-governed-state': ApiBjpGovernedStateBjpGovernedState;
      'api::bjp-live-tag.bjp-live-tag': ApiBjpLiveTagBjpLiveTag;
      'api::budget-glance-type.budget-glance-type': ApiBudgetGlanceTypeBudgetGlanceType;
      'api::campaign-materials-photo-type.campaign-materials-photo-type': ApiCampaignMaterialsPhotoTypeCampaignMaterialsPhotoType;
      'api::campaign-materials-state-photo-type.campaign-materials-state-photo-type': ApiCampaignMaterialsStatePhotoTypeCampaignMaterialsStatePhotoType;
      'api::campaign-materials-state-video-type.campaign-materials-state-video-type': ApiCampaignMaterialsStateVideoTypeCampaignMaterialsStateVideoType;
      'api::campaign-materials-video-type.campaign-materials-video-type': ApiCampaignMaterialsVideoTypeCampaignMaterialsVideoType;
      'api::committee.committee': ApiCommitteeCommittee;
      'api::committees-designation.committees-designation': ApiCommitteesDesignationCommitteesDesignation;
      'api::common-year-master.common-year-master': ApiCommonYearMasterCommonYearMaster;
      'api::delhi-district.delhi-district': ApiDelhiDistrictDelhiDistrict;
      'api::department-type.department-type': ApiDepartmentTypeDepartmentType;
      'api::designation.designation': ApiDesignationDesignation;
      'api::domain.domain': ApiDomainDomain;
      'api::election-format-type.election-format-type': ApiElectionFormatTypeElectionFormatType;
      'api::election-state.election-state': ApiElectionStateElectionState;
      'api::global.global': ApiGlobalGlobal;
      'api::history-of-the-party-year.history-of-the-party-year': ApiHistoryOfThePartyYearHistoryOfThePartyYear;
      'api::infographic-type.infographic-type': ApiInfographicTypeInfographicType;
      'api::interest.interest': ApiInterestInterest;
      'api::journey-year.journey-year': ApiJourneyYearJourneyYear;
      'api::language.language': ApiLanguageLanguage;
      'api::leader-type.leader-type': ApiLeaderTypeLeaderType;
      'api::leaders-type.leaders-type': ApiLeadersTypeLeadersType;
      'api::leaders.leaders': ApiLeadersLeaders;
      'api::lok-sabha-state-and-pc-listing.lok-sabha-state-and-pc-listing': ApiLokSabhaStateAndPcListingLokSabhaStateAndPcListing;
      'api::loksabhamember.loksabhamember': ApiLoksabhamemberLoksabhamember;
      'api::manifesto-language.manifesto-language': ApiManifestoLanguageManifestoLanguage;
      'api::member-type.member-type': ApiMemberTypeMemberType;
      'api::microsite-inforgarphic-type.microsite-inforgarphic-type': ApiMicrositeInforgarphicTypeMicrositeInforgarphicType;
      'api::minister-type.minister-type': ApiMinisterTypeMinisterType;
      'api::ministry.ministry': ApiMinistryMinistry;
      'api::month.month': ApiMonthMonth;
      'api::morcha-type.morcha-type': ApiMorchaTypeMorchaType;
      'api::national-executive-category.national-executive-category': ApiNationalExecutiveCategoryNationalExecutiveCategory;
      'api::national-executive-year.national-executive-year': ApiNationalExecutiveYearNationalExecutiveYear;
      'api::national-general-secretary-categ.national-general-secretary-categ': ApiNationalGeneralSecretaryCategNationalGeneralSecretaryCateg;
      'api::organisation-designation.organisation-designation': ApiOrganisationDesignationOrganisationDesignation;
      'api::parliamentary-board-designation.parliamentary-board-designation': ApiParliamentaryBoardDesignationParliamentaryBoardDesignation;
      'api::pc-type.pc-type': ApiPcTypePcType;
      'api::phase-type.phase-type': ApiPhaseTypePhaseType;
      'api::photo-gallery-type.photo-gallery-type': ApiPhotoGalleryTypePhotoGalleryType;
      'api::photo-gallery.photo-gallery': ApiPhotoGalleryPhotoGallery;
      'api::press-releases.press-releases': ApiPressReleasesPressReleases;
      'api::rajya-sabha-state-listing.rajya-sabha-state-listing': ApiRajyaSabhaStateListingRajyaSabhaStateListing;
      'api::release-type.release-type': ApiReleaseTypeReleaseType;
      'api::social-stream-type.social-stream-type': ApiSocialStreamTypeSocialStreamType;
      'api::state-infographic-type.state-infographic-type': ApiStateInfographicTypeStateInfographicType;
      'api::state-presidents-designation.state-presidents-designation': ApiStatePresidentsDesignationStatePresidentsDesignation;
      'api::state.state': ApiStateState;
      'api::tag.tag': ApiTagTag;
      'api::time-duration.time-duration': ApiTimeDurationTimeDuration;
      'api::union-budget-year.union-budget-year': ApiUnionBudgetYearUnionBudgetYear;
      'api::user-admin.user-admin': ApiUserAdminUserAdmin;
      'api::uttar-pradesh-district.uttar-pradesh-district': ApiUttarPradeshDistrictUttarPradeshDistrict;
      'api::video-gallery-type.video-gallery-type': ApiVideoGalleryTypeVideoGalleryType;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
