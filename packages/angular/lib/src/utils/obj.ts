
const hasOwnProperty = Object.prototype.hasOwnProperty;

/*
Really simple clone utility. Only copies plain arrays, objects, and Dates. Transfers everything else as-is.
Wanted to use a third-party lib, but none did exactly this.
*/
export function deepCopy(input: any): any {

  if (Array.isArray(input)) {
    return input.map(deepCopy);

  } else if (input instanceof Date) {
    return new Date(input.valueOf());

  } else if (typeof input === 'object' && input) { // non-null object
    return mapHash(input, deepCopy);

  } else { // everything else (null, function, etc)
    return input;
  }
}


export function mapHash(input: any, func: any): any {
  const output: { [key: string]: any } = {};

  for (const key in input) {
    if (hasOwnProperty.call(input, key)) {
      output[key] = func(input[key], key);
    }
  }

  return output;
}
