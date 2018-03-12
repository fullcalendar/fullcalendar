
export function assignTo(target, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i]
    if (source != null) { // skip over if undefined or null
      for (let key in source) {
        // avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
  }
  return target
}

export function isEmpty(obj) {
  for (let _key in obj) {
    return false
  }
  return true
}
