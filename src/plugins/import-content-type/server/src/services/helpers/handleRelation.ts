import { getImageUrlFromTaxonomy } from '../../utils/media';
import { findDrupalRelationshipData } from '../../utils/strapi-queries';

const handleGenericRelation = (relationshipData, strapiRelKey): number => {
  let id = null;
  findDrupalRelationshipData(relationshipData.id, strapiRelKey)
    .then((id) => {
      id = id;
      return id;
    })
    .catch(() => {
      id = relationshipData.id as number;
    });

  return id;
};

const handleImageRelation = (baseUrl, relationshipData, includedData): string | null => {
  return getImageUrlFromTaxonomy(baseUrl, relationshipData, includedData);
};

const handleRelationsBasedOnType = (baseUrl, relationshipData, strapiRelKey, includedData) => {
  switch (relationshipData.type) {
    case 'file--file':
    case 'media--image':
      return handleImageRelation(baseUrl, relationshipData, includedData);
    default:
      return handleGenericRelation(relationshipData, strapiRelKey);
  }
};

export const handleRelation = (baseUrl, relationshipData, strapiRelKey, includedResult) => {
  if (Array.isArray(relationshipData)) {
    // Resolve all relationship promises in the array
    const data = relationshipData.map((relation: any) => {
      const includedData = includedResult.find((item) => item.id === relation.id);
      return handleRelationsBasedOnType(baseUrl, relation, strapiRelKey, includedData);
    });

    return data;
  } else if (relationshipData && relationshipData.id) {
    const includedData = includedResult.find((item) => item.id === relationshipData.id);
    const data = handleRelationsBasedOnType(baseUrl, relationshipData, strapiRelKey, includedData);

    return data;
  }
};
