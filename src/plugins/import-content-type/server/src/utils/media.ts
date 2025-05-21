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
