
const hasOwnProperty = Object.prototype.hasOwnProperty

// Merges an array of objects into a single object.
// The second argument allows for an array of property names who's object values will be merged together.
export function mergeProps(propObjs, complexProps?): any {
  let dest = {}
  let i
  let name
  let complexObjs
  let j
  let val
  let props

  if (complexProps) {
    for (i = 0; i < complexProps.length; i++) {
      name = complexProps[i]
      complexObjs = []

      // collect the trailing object values, stopping when a non-object is discovered
      for (j = propObjs.length - 1; j >= 0; j--) {
        val = propObjs[j][name]

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
  for (i = propObjs.length - 1; i >= 0; i--) {
    props = propObjs[i]

    for (name in props) {
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
  func: (input: InputItem, key: string) => OutputItem
): { [key: string]: OutputItem } {
  let newHash = {}

  for (let key in hash) {
    newHash[key] = func(hash[key], key)
  }

  return newHash
}


export function arrayToHash(a): { [key: string]: true } {
  let hash = {}

  for (let item of a) {
    hash[item] = true
  }

  return hash
}


export function hashValuesToArray(obj) {
  let a = []

  for (let key in obj) {
    a.push(obj[key])
  }

  return a
}


export function isPropsEqual(obj0, obj1) {

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
