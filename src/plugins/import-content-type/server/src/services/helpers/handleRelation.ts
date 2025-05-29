import { getImageUrlFromIncluded } from '../../utils/media';
import { findDrupalRelationshipData } from '../../utils/strapi-queries';
import { convertHyphenToChar } from '../../utils/strings';

const handleGenericRelation = async (relationshipData, strapiRelKey): Promise<number | null> => {
  const id = await findDrupalRelationshipData(relationshipData.id, strapiRelKey);
  return id;
};

const handleRelationsBasedOnType = async (
  baseUrl,
  relationshipData,
  strapiRelKey,
  includedData,
  contentType
) => {
  switch (relationshipData.type) {
    case 'file--file':
    case 'media--image':
      return getImageUrlFromIncluded(baseUrl, relationshipData, includedData);
    case `taxonomy_term--${convertHyphenToChar(contentType)}`:
      return await findDrupalRelationshipData(relationshipData.id, strapiRelKey, contentType);
    default:
      return await handleGenericRelation(relationshipData, strapiRelKey);
  }
};

export const handleRelation = async (
  baseUrl,
  relationshipData,
  strapiRelKey,
  includedResult,
  contentType
) => {
  if (Array.isArray(relationshipData)) {
    // Resolve all relationship promises in the array
    const data = await Promise.all(
      relationshipData.map(async (relation: any) => {
        const includedData = includedResult.find((item) => item.id === relation.id);
        return await handleRelationsBasedOnType(
          baseUrl,
          relation,
          strapiRelKey,
          includedData,
          contentType
        );
      })
    );

    return data;
  } else if (relationshipData && relationshipData.id) {
    const includedData = includedResult.find((item) => item.id === relationshipData.id);
    const data = await handleRelationsBasedOnType(
      baseUrl,
      relationshipData,
      strapiRelKey,
      includedData,
      contentType
    );

    return data;
  }
};
