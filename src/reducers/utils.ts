
export function filterHash(hash, func) {
  let filtered = {}

  for (let key in hash) {
    if (func(hash[key], key)) {
      filtered[key] = hash[key]
    }
  }

  return filtered
}

export function refineProps(rawProps, processorFuncs, leftoverProps?): any {
  let refined = {}

  for (let key in processorFuncs) {
    if (rawProps[key] == null) {
      refined[key] = null
    } else if (processorFuncs[key]) {
      refined[key] = processorFuncs[key](rawProps[key])
    } else {
      refined[key] = rawProps[key]
    }
  }

  if (leftoverProps) {
    for (let key in rawProps) {
      if (processorFuncs[key] === undefined) {
        leftoverProps[key] = rawProps[key]
      }
    }
  }

  return refined
}

export type ClassNameInput = string | string[]

export function parseClassName(raw: ClassNameInput) {
  if (Array.isArray(raw)) {
    return raw
  } else if (typeof raw === 'string') {
    return raw.split(/\s+/)
  } else {
    return []
  }
}

export function arrayToHash(a) {
  let hash = {}

  for (let item of a) {
    hash[item] = true
  }

  return hash
}
