export const convertAllToChar = (input, char = '-') => {
  return input
    .replace(/[^a-zA-Z0-9]/g, char) // replace any non-alphanumeric char with hyphen
    .replace(/\-+/g, char) // collapse multiple hyphens into one
    .replace(/^\-+|\-+$/g, ''); // trim leading/trailing hyphens
};

export const convertSpaceToChar = (input, char = '-') => {
  return input.replace(/\s+/g, char);
};
