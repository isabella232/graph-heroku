import { isObject, isArray } from 'util';

export default function keysToCamel(input) {
  if (isArray(input)) {
    return input.map((i) => {
      return keysToCamel(i);
    });
  } else if (isObject(input)) {
    const n = {};

    Object.keys(input).forEach((key) => {
      n[snakeToCamel(key)] = keysToCamel(input[key]);
    });

    return n;
  }

  return input;
}

function snakeToCamel(key: string): string {
  return key.replace(/([_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('_', '');
  });
}
