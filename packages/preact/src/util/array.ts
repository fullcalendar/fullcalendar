import { valuesIdentical } from './misc'

// TODO: new util arrayify?
// Array.prototype.slice.call(

export function flatArray<Item>(
  items: readonly (Item | readonly Item[])[],
): Item[] {
  const res: Item[] = []

  for (const item of items) {
    if (Array.isArray(item)) {
      for (const subItem of item) {
        res.push(subItem)
      }
    } else {
      res.push(item as Item)
    }
  }

  return res
}

export function flatMapArray<Input, Output>(
  inputs: readonly Input[],
  mapFunc: (input: Input, index: number) => Output | readonly Output[],
): Output[] {
  const res: Output[] = []

  for (let i = 0; i < inputs.length; i += 1) {
    const output = mapFunc(inputs[i], i)

    if (Array.isArray(output)) {
      for (const subOutput of output) {
        res.push(subOutput)
      }
    } else {
      res.push(output as Output)
    }
  }

  return res
}

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
