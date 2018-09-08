
const hasOwnPropMethod = {}.hasOwnProperty


export function assignTo(target, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i]
    if (source != null) { // skip over if undefined or null
      for (let key in source) {
        // avoid bugs when hasOwnProperty is shadowed
        if (hasOwnProp(source, key)) {
          target[key] = source[key]
        }
      }
    }
  }
  return target
}


export function copyOwnProps(src, dest) {
  for (let name in src) {
    if (hasOwnProp(src, name)) {
      dest[name] = src[name]
    }
  }
}


function hasOwnProp(obj, name) {
  return hasOwnPropMethod.call(obj, name)
}


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


export function mapHash(hash, func) {
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
