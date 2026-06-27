import { valuesIdentical } from './misc'

// TODO: new util arrayify?
// Array.prototype.slice.call(

export function removeMatching(array: any[], testFunc) {
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

export function removeExact(array: any[], exactItem) {
  let removeCnt = 0
  let i = 0

  while (i < array.length) {
    if (array[i] === exactItem) {
      array.splice(i, 1)
      removeCnt += 1
    } else {
      i += 1
    }
  }

  return removeCnt
}

export function isMaybeArraysEqual(array0: any[], array1: any[]) {
  if (Array.isArray(array0) && Array.isArray(array1)) {
    return isArraysEqual(array0, array1)
  }
  return array0 === array1
}

export function isArraysEqual(
  array0: any[],
  array1: any[],
  itemsEqual = valuesIdentical,
) {
  if (array0 === array1) {
    return true
  }

  let len = array0.length
  let i

  if (len !== array1.length) { // not array? or not same length?
    return false
  }

  for (i = 0; i < len; i += 1) {
    if (!itemsEqual(array0[i], array1[i])) {
      return false
    }
  }

  return true
}
