export const checkFolderExists = async (folderName: string) => {
  const folder = await strapi.query('plugin::upload.folder').findOne({
    where: {
      name: folderName,
    },
  });
  return folder?.id;
};

export const createFolder = async (folderName: string) => {
  const folder = await strapi.query('plugin::upload.folder').create({
    data: {
      name: folderName,
    },
  });
  return folder?.id;
};

export const checkFileExists = async (fileName: string) => {
  const file = await strapi.query('plugin::upload.file').findOne({
    where: {
      name: fileName,
    },
  });
  return file?.id;
};

export const getImageUrlFromTaxonomy = (baseUrl, relationshipData, included): string | null => {
  if (!relationshipData) return null;

  // Direct file relation
  if (relationshipData.type === 'file--file') {
    const file = included;
    return file?.attributes?.uri?.url ? `${baseUrl}${file?.attributes?.uri?.url}` : null;
  }

  // Media reference → file
  if (relationshipData.type === 'media--image') {
    const media = included;
    const fileRel = media?.relationships?.field_media_image?.data;
    const file = included.find((item) => item.type === 'file--file' && item.id === fileRel?.id);
    return file?.attributes?.uri?.url ? `baseUrl/${file.attributes.uri.url}` : null;
  }

  return null;
};
