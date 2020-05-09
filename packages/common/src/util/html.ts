
export type ClassNameInput = string | string[]

export function parseClassNames(raw: ClassNameInput) {
  if (Array.isArray(raw)) {
    return raw
  } else if (typeof raw === 'string') {
    return raw.split(/\s+/)
  } else {
    return []
  }
}
