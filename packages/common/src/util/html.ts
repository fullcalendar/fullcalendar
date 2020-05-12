
export type ClassNamesInput = string | string[]


export function parseClassNames(raw: ClassNamesInput) {
  if (Array.isArray(raw)) {
    return raw
  } else if (typeof raw === 'string') {
    return raw.split(/\s+/)
  } else {
    return []
  }
}
