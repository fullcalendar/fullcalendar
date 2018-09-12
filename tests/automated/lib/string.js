
export function removeLtrCharCodes(s) {
  return s.replace(/\u200e/g, '')
}
