function convertAllToHyphens(input) {
  return input
    .replace(/[^a-zA-Z0-9]/g, '-') // replace any non-alphanumeric char with hyphen
    .replace(/\-+/g, '-') // collapse multiple hyphens into one
    .replace(/^\-+|\-+$/g, ''); // trim leading/trailing hyphens
}
