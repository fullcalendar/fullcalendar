const { hasOwnProperty } = Object.prototype

// Merges an array of objects into a single object.
// The second argument allows for an array of property names who's object values will be merged together.
export function mergeProps(propObjs, complexPropsMap?): any {
  let dest = {}

  if (complexPropsMap) {
    for (let name in complexPropsMap) {
      let complexObjs = []

      // collect the trailing object values, stopping when a non-object is discovered
      for (let i = propObjs.length - 1; i >= 0; i -= 1) {
        let val = propObjs[i][name]

        if (typeof val === 'object' && val) { // non-null object
          complexObjs.unshift(val)
        } else if (val !== undefined) {
          dest[name] = val // if there were no objects, this value will be used
          break
        }
      }

      // if the trailing values were objects, use the merged value
      if (complexObjs.length) {
        dest[name] = mergeProps(complexObjs)
      }
    }
  }

  // copy values into the destination, going from last to first
  for (let i = propObjs.length - 1; i >= 0; i -= 1) {
    let props = propObjs[i]

    for (let name in props) {
      if (!(name in dest)) { // if already assigned by previous props or complex props, don't reassign
        dest[name] = props[name]
      }
    }
  }

  return dest
}

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

export function arrayToHash(a): { [key: string]: true } { // TODO: rename to strinArrayToHash or something
  let hash = {}

  for (let item of a) {
    hash[item] = true
  }

  return hash
}

export function buildHashFromArray<Item, ItemRes>(a: Item[], func: (item: Item, index: number) => [ string, ItemRes ]) {
  let hash: { [key: string]: ItemRes } = {}

  for (let i = 0; i < a.length; i += 1) {
    let tuple = func(a[i], i)

    hash[tuple[0]] = tuple[1]
  }

  return hash
}

export function hashValuesToArray(obj) { // can't use Object.values yet because of no IE support
  let a = []

  for (let key in obj) {
    a.push(obj[key])
  }

  return a
}

export function isPropsEqual(obj0, obj1) { // TODO: merge with compareObjs
  if (obj0 === obj1) {
    return true
  }

  for (let key in obj0) {
    if (hasOwnProperty.call(obj0, key)) {
      if (!(key in obj1)) {
        return false
      }
    }
  }

  for (let key in obj1) {
    if (hasOwnProperty.call(obj1, key)) {
      if (obj0[key] !== obj1[key]) {
        return false
      }
    }
  }

  return true
}

export function getUnequalProps(obj0, obj1) {
  let keys: string[] = []

  for (let key in obj0) {
    if (hasOwnProperty.call(obj0, key)) {
      if (!(key in obj1)) {
        keys.push(key)
      }
    }
  }

  for (let key in obj1) {
    if (hasOwnProperty.call(obj1, key)) {
      if (obj0[key] !== obj1[key]) {
        keys.push(key)
      }
    }
  }

  return keys
}

export type EqualityFunc<T> = (a: T, b: T) => boolean
export type EqualityThing<T> = EqualityFunc<T> | true

export type EqualityFuncs<ObjType> = { // not really just a "func" anymore
  [K in keyof ObjType]?: EqualityThing<ObjType[K]>
}

export function compareObjs(oldProps, newProps, equalityFuncs: EqualityFuncs<any> = {}) {
  if (oldProps === newProps) {
    return true
  }

  for (let key in newProps) {
    if (key in oldProps && isObjValsEqual(oldProps[key], newProps[key], equalityFuncs[key])) {
      // equal
    } else {
      return false
    }
  }

  // check for props that were omitted in the new
  for (let key in oldProps) {
    if (!(key in newProps)) {
      return false
    }
  }

  return true
}

/*
assumed "true" equality for handler names like "onReceiveSomething"
*/
function isObjValsEqual<T>(val0: T, val1: T, comparator: EqualityThing<T>) {
  if (val0 === val1 || comparator === true) {
    return true
  }
  if (comparator) {
    return comparator(val0, val1)
  }
  return false
}

export function collectFromHash<Item>(
  hash: { [key: string]: Item },
  startIndex = 0,
  endIndex?: number,
  step = 1,
) {
  let res: Item[] = []

  if (endIndex == null) {
    endIndex = Object.keys(hash).length
  }

  for (let i = startIndex; i < endIndex; i += step) {
    let val = hash[i]

    if (val !== undefined) { // will disregard undefined for sparse arrays
      res.push(val)
    }
  }

  return res
}
