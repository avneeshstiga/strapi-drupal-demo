export const findDrupalRelationshipData = async (
  drupalId: string,
  strapiRel: string
): Promise<number | null> => {
  try {
    strapi.log.info(
      `--- Finding Drupal relationship data for ${strapiRel} with drupal id ${drupalId} ---`
    );
    const data = await strapi.documents(`api::${strapiRel}.${strapiRel}`).findFirst({
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
