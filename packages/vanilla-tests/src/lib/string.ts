export function removeLtrCharCodes(s) {
  return s.replace(/\u200e/g, '')
}

export function removeCommas(s) {
  return s.replaceAll(',', '')
}

export function moveDayNumberLast(s: string): string {
  const m = s.match(/^(\d+) (.*$)/)
  if (m) {
    return m[2] + ' ' + m[1]
  }
  return s
}
