import type { Schema, Struct } from '@strapi/strapi';

export interface SharedHighlightState extends Struct.ComponentSchema {
  collectionName: 'components_shared_highlight_states';
  info: {
    description: '';
    displayName: 'highlight_state';
  };
  attributes: {
    state_highlight: Schema.Attribute.Enumeration<['None', 'Yes', 'No']> &
      Schema.Attribute.DefaultTo<'None'>;
  };
}

export interface SharedLanguage extends Struct.ComponentSchema {
  collectionName: 'components_shared_languages';
  info: {
    description: 'Language selector component';
    displayName: 'Language';
    icon: 'globe';
  };
  attributes: {
    code: Schema.Attribute.Enumeration<['en', 'hi', 'sv']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'en'>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    seo_josn: Schema.Attribute.JSON;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.highlight-state': SharedHighlightState;
      'shared.language': SharedLanguage;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
