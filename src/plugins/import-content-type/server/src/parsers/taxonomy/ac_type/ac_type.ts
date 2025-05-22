/**
 * Maps external article data to Strapi collection type format.
 */
export const mapToStrapiAcType = (externalItem) => {
  const { attributes } = externalItem;
  return {
    drupal_internal__tid: attributes.drupal_internal__tid,
    ac_type_status: attributes.status,
    name: attributes.name,
    description: attributes.description,
    weight: attributes.weight,
    field_taxonomy_pim_id: attributes.field_taxonomy_pim_id,
  };
};
