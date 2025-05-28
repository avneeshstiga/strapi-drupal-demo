import { getImageUrlFromIncluded } from '../../utils/media';
import { findDrupalRelationshipData } from '../../utils/strapi-queries';

const handleGenericRelation = async (relationshipData, strapiRelKey): Promise<number> => {
  try {
    const id = await findDrupalRelationshipData(relationshipData.id, strapiRelKey);
    return id;
  } catch {
    return relationshipData.id as number;
  }
};

const handleRelationsBasedOnType = async (
  baseUrl,
  relationshipData,
  strapiRelKey,
  includedData
) => {
  switch (relationshipData.type) {
    case 'file--file':
    case 'media--image':
      return getImageUrlFromIncluded(baseUrl, relationshipData, includedData);
    default:
      return await handleGenericRelation(relationshipData, strapiRelKey);
  }
};

export const handleRelation = async (baseUrl, relationshipData, strapiRelKey, includedResult) => {
  if (Array.isArray(relationshipData)) {
    // Resolve all relationship promises in the array
    const data = await Promise.all(
      relationshipData.map(async (relation: any) => {
        const includedData = includedResult.find((item) => item.id === relation.id);
        return await handleRelationsBasedOnType(baseUrl, relation, strapiRelKey, includedData);
      })
    );

    return data;
  } else if (relationshipData && relationshipData.id) {
    const includedData = includedResult.find((item) => item.id === relationshipData.id);
    const data = await handleRelationsBasedOnType(
      baseUrl,
      relationshipData,
      strapiRelKey,
      includedData
    );

    return data;
  }
};
