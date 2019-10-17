
export function htmlEscape(s) {
  return (s + '').replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#039;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br />')
}


// Given a hash of CSS properties, returns a string of CSS.
// Uses property names as-is (no camel-case conversion). Will not make statements for null/undefined values.
export function cssToStr(cssProps) {
  let statements = []

  for (let name in cssProps) {
    let val = cssProps[name]
    if (val != null && val !== '') {
      statements.push(name + ':' + val)
    }
  }

  return statements.join(';')
}


// Given an object hash of HTML attribute names to values,
// generates a string that can be injected between < > in HTML
export function attrsToStr(attrs) {
  let parts = []

  for (let name in attrs) {
    let val = attrs[name]
    if (val != null) {
      parts.push(name + '="' + htmlEscape(val) + '"')
    }
  }

  return parts.join(' ')
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
