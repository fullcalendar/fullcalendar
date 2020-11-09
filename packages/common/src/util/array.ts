// TODO: new util arrayify?
// Array.prototype.slice.call(

export function removeMatching(array, testFunc) {
  let removeCnt = 0
  let i = 0

  while (i < array.length) {
    if (testFunc(array[i])) { // truthy value means *remove*
      array.splice(i, 1)
      removeCnt += 1
    } else {
      i += 1
    }
  }

  return removeCnt
}

export function removeExact(array, exactVal) {
  let removeCnt = 0
  let i = 0

  while (i < array.length) {
    if (array[i] === exactVal) {
      array.splice(i, 1)
      removeCnt += 1
    } else {
      i += 1
    }
  }

  return removeCnt
}

export function isArraysEqual(a0, a1, equalityFunc?: (v0, v1) => boolean) { // TODO: better typing
  if (a0 === a1) {
    return true
  }

  let len = a0.length
  let i

  if (len !== a1.length) { // not array? or not same length?
    return false
  }

  for (i = 0; i < len; i += 1) {
    if (!(equalityFunc ? equalityFunc(a0[i], a1[i]) : a0[i] === a1[i])) {
      return false
    }
  }

  return true
}
