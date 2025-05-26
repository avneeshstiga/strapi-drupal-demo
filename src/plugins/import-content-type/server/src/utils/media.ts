export const checkFileExists = async (fileName: string, folderId: number) => {
  const file = await strapi.query('plugin::upload.file').findOne({
    where: {
      name: fileName,
      folder: folderId,
    },
  });
  return file?.id;
};

export const getImageUrlFromIncluded = (baseUrl, relationshipData, included): string | null => {
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

export const handleFolder = async (fileUrl) => {
  const { pathname } = new URL(fileUrl); // sample: /files/pictures/2025-05/filename.jpg
  const segments = pathname.split('/').filter(Boolean);

  const folderSegments = segments.slice(1, -1); // skip "files", remove filename

  let parentId = null;
  let folderPath = '';

  for (const segment of folderSegments) {
    const name = decodeURIComponent(segment);

    try {
      const existing = await strapi.query('plugin::upload.folder').findOne({
        where: { name, parent: parentId },
      });

      if (existing) {
        parentId = existing.id;
        strapi.log.info(`Folder ${name} already exists, ${parentId}`);
        continue;
      }

      const folder = await strapi.query('plugin::upload.folder').create({
        data: {
          name,
          parent: parentId,
          folderPath,
        },
      });

      strapi.log.info(`Folder ${name} created, ${folder.id}`);
      parentId = folder.id;
    } catch (error) {
      strapi.log.error(`Error creating folder ${folderPath}: ${error}`);
    }
  }

  return parentId;
};

// export const checkFolderExists = async (folderName: string) => {
//   const folder = await strapi.query('plugin::upload.folder').findOne({
//     where: {
//       name: folderName,
//     },
//   });
//   return folder?.id;
// };

// export const createFolder = async (folderName: string) => {
//   const folders = await strapi.query('plugin::upload.folder').findMany({
//     orderBy: { id: 'desc' },
//     limit: 1,
//   });
//   const nextId = folders.length ? folders[0].id + 1 : 1;
//   const path = `/${nextId}`;

//   const folder = await strapi.query('plugin::upload.folder').create({
//     data: {
//       name: folderName,
//       folderPath: path,
//     },
//   });
//   return folder?.id;
// };
