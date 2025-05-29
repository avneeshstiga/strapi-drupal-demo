/**
 * Strict validation: validates data against schema and rejects unknown fields.
 * @param {ContentTypeSchema} schema
 * @param {object} data
 * @throws Will throw if validation fails or unknown fields are found
 */
export const validateRecordAgainstSchema = async (schema, data, update = false) => {
  const schemaFields = Object.keys(schema.attributes);
  const inputFields = Object.keys(data);

  // Let Strapi validate required fields and types
  update
    ? await strapi.entityValidator.validateEntityUpdate(schema, data)
    : await strapi.entityValidator.validateEntityCreation(schema, data);

  // Find fields not defined in schema
  const unknownFields = inputFields.filter((f) => !schemaFields.includes(f));

  if (unknownFields.length) {
    throw {
      message: `Unknown fields: ${unknownFields.join(', ')}`,
    };
  }
};
