import { valuesIdentical } from './misc'

const { hasOwnProperty } = Object.prototype

// Filter / Map
// -------------------------------------------------------------------------------------------------

export function filterHash(hash, func) {
  let filtered = {}

  for (let key in hash) {
    if (func(hash[key], key)) {
      filtered[key] = hash[key]
    }
  }

  return filtered
}

export function mapHash<InputItem, OutputItem>(
  hash: { [key: string]: InputItem },
  func: (input: InputItem, key: string) => OutputItem,
): { [key: string]: OutputItem } {
  let newHash = {}

  for (let key in hash) {
    newHash[key] = func(hash[key], key)
  }

  return newHash
}

// Conversion
// -------------------------------------------------------------------------------------------------

// Can't use Object.values yet because no es2015 support
// TODO: reassess browser support
// https://caniuse.com/?search=object.values
export function hashValuesToArray(obj) {
  let a = []

  for (let key in obj) {
    a.push(obj[key])
  }

  return a
}

// TODO: rename to stringArrayToHash or something
export function arrayToHash(a): { [key: string]: true } {
  let hash = {}

  for (let item of a) {
    hash[item] = true
  }

  return hash
}

export function buildHashFromArray<Item, ItemRes>(
  a: Item[],
  func: (item: Item, index: number) => [ string, ItemRes ],
) {
  let hash: { [key: string]: ItemRes } = {}

  for (let i = 0; i < a.length; i += 1) {
    let tuple = func(a[i], i)
    hash[tuple[0]] = tuple[1]
  }

  return hash
}

// Equality
// -------------------------------------------------------------------------------------------------

export function isMaybePropsEqualDepth1(props0: any, props1: any) {
  if (
    typeof props0 === 'object' && props0 && // non-null object
    typeof props1 === 'object' && props1 // non-null object
  ) {
    return isPropsEqualWithFunc(props0, props1, isPropsEqualShallow)
  }
  return props0 === props1
}

export function isPropsEqualWithFunc(
  props0: any,
  props1: any,
  valuesEqual: ((val0: any, val1: any, key: string | symbol) => boolean),
) {
  if (props0 === props1) {
    return true
  }

  for (let key in props0) {
    if (hasOwnProperty.call(props0, key)) {
      if (!(key in props1)) {
        return false
      }
    }
  }

  for (let key in props1) {
    if (hasOwnProperty.call(props1, key)) {
      if (!(key in props0) || !valuesEqual(props0[key], props1[key], key)) {
        return false
      }
    }
  }

  return true
}

export function isMaybePropsEqualShallow(props0: any, props1: any) {
  if (
    typeof props0 === 'object' &&
    typeof props1 === 'object' &&
    props0 && props1 // both non-null objects
  ) {
    return isPropsEqualShallow(props0, props1)
  }
  return props0 === props1
}

export function isPropsEqualShallow(props0: any, props1: any) {
  return isPropsEqualWithFunc(props0, props1, valuesIdentical)
}

export function isPropsEqualWithMap(
  props0: any,
  props1: any,
  equalityFuncMap: {
    [key: string | symbol]: (val0: any, val1: any) => boolean
  },
  // debugMessage?: string
) {
  return isPropsEqualWithFunc(
    props0,
    props1,
    (val0, val1, key) => {
      const equalityFunc = equalityFuncMap[key]
      const isEqual = equalityFunc
        ? equalityFunc(val0, val1)
        : val0 === val1

      // if (debugMessage && !isEqual) {
      //   console.log(
      //     debugMessage, key, 'NOT EQUAL', 'rerunning...',
      //     equalityFunc
      //       ? equalityFunc(val0, val1)
      //       : val0 === val1
      //   )
      // }

      return isEqual
    }
  )
}

/*
Returns array of keys
*/
export function getUnequalProps(props0, props1) {
  let keys: string[] = []

  for (let key in props0) {
    if (hasOwnProperty.call(props0, key)) {
      if (!(key in props1)) {
        keys.push(key)
      }
    }
  }

  for (let key in props1) {
    if (hasOwnProperty.call(props1, key)) {
      if (props0[key] !== props1[key]) {
        keys.push(key)
      }
    }
  }

  return keys
}

// Merge
// -------------------------------------------------------------------------------------------------

export function mergeMaybePropsDepth1(props0: any, props1: any) {
  if (!props0) {
    return props1
  }
  return mergePropsWithFunc(props0, props1, mergePropsShallow)
}

export function mergePropsWithFunc(
  props0: any,
  props1: any,
  mergeValues: ((val0: any, val1: any) => any),
) {
  const dest: any = {}

  for (let key in props0) {
    if (hasOwnProperty.call(props0, key)) {
      if (!(key in props1)) {
        dest[key] = props0[key]
      }
    }
  }

  for (let key in props1) {
    if (hasOwnProperty.call(props1, key)) {
      if (!(key in props0)) {
        dest[key] = props1[key]
      } else {
        dest[key] = mergeValues(props0[key], props1[key])
      }
    }
  }

  return dest
}

// Could return something falsy
export function mergeMaybePropsShallow(props0: any, props1: any) {
  if (
    typeof props0 === 'object' && props0 && // non-null object
    typeof props1 === 'object' && props1
  ) {
    return mergePropsShallow(props0, props1)
  }

  if (props1 === undefined) {
    return props0
  }

  return props1
}

export function mergePropsShallow(props0: any, props1: any) {
  return Object.assign({}, props0, props1)
}
