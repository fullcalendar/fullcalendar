
export function isInt(n) {
  return n % 1 === 0
}

export function trimEnd(s: string): string {
  return s.replace(/\s+$/, '')
}

export function padStart(val, len) { // doesn't work with total length more than 3
  let s = String(val)
  return '000'.substr(0, len - s.length) + s
}
