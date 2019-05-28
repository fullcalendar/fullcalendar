
/*
depth=1 means look at immediate children
depth=0 means only look at val identities
*/
export function isValuesSimilar(val0, val1, depth = 1) {
  if (val0 === val1) {
    return true

  } else if (Array.isArray(val0) && Array.isArray(val1)) {
    return isArraysSimilar(val0, val1, depth)

  } else if (typeof val0 === 'object' && val0 && typeof val1 === 'object' && val1) { // non-null objects
    return isObjectsSimilar(val0, val1, depth)

  } else {
    return false
  }
}

export function isArraysSimilar(a0, a1, depth = 1) {
  if (a0 === a1) {
    return true

  } else if (depth > 0) {

    if (a0.length !== a1.length) {
      return false

    } else {
      for (let i = 0; i < a0.length; i++) {
        if (!isValuesSimilar(a0[i], a1[i], depth - 1)) {
          return false
        }
      }

      return true
    }

  } else {
    return false
  }
}

export function isObjectsSimilar(obj0, obj1, depth = 1) {
  if (obj0 === obj1) {
    return true

  } else if (depth > 0) {

    for (let prop in obj0) {
      if (!(prop in obj1)) {
        return false
      }
    }

    for (let prop in obj1) {
      if (!(prop in obj0)) {
        return false
      } else {
        if (!isValuesSimilar(obj0[prop], obj1[prop], depth - 1)) {
          return false
        }
      }
    }

    return true

  } else {
    return false
  }
}

export function computeChangedProps(obj0, obj1, depth = 1) {
  let res = {}

  for (let prop in obj1) {
    if (
      !(prop in obj0) ||
      !isValuesSimilar(obj0[prop], obj1[prop], depth - 1)
    ) {
      res[prop] = obj1[prop]
    }
  }

  return res
}

export function anyKeysRemoved(obj0, obj1) {
  for (let prop in obj0) {
    if (!(prop in obj1)) {
      return true
    }
  }
  return false
}
