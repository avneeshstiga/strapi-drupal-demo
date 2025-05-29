export const findDrupalRelationshipData = async (
  drupalId: string,
  strapiRel: string,
  contentType?: string
): Promise<number | null> => {
  try {
    strapi.log.info(
      `--- Finding Drupal relationship data for ${strapiRel}, contentType: ${contentType} with drupal id ${drupalId} ---`
    );
    const type = contentType ? contentType : strapiRel;
    const data = await strapi.documents(`api::${type}.${type}`).findFirst({
      filters: {
        drupal_id: {
          $eqi: drupalId,
        },
      },
    });
    strapi.log.info(
      `--- Found Drupal relationship data for ${strapiRel} with strapi id ${data?.id} ---`
    );

    return data?.id;
  } catch (error) {
    strapi.log.error(`Error finding Drupal relationship data for ${strapiRel}: ${error.message}`);
    throw new Error(`Error finding Drupal relationship data for ${strapiRel}: ${error.message}`);
  }
};

export const findStrapiDocument = async (
  drupalId: string,
  contentType: string
): Promise<{ id: number; publishedAt: string } | null> => {
  try {
    const data = await strapi.documents(`api::${contentType}.${contentType}`).findFirst({
      fields: ['id', 'publishedAt'],
      filters: {
        drupal_id: {
          $eqi: drupalId,
        },
      },
    });
    strapi.log.info(`--- Found strapi document for ${contentType} with strapi id ${data?.id} ---`);

    return { id: data?.id, publishedAt: data?.publishedAt };
  } catch (error) {
    strapi.log.error(`Error finding strapi document for ${contentType}: ${error.message}`);
    throw new Error(`Error finding strapi document for ${contentType}: ${error.message}`);
  }
};
