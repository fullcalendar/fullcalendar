export type TimeGridPrintMode = 'positioned' | 'stack'

// Firefox is terrible at rendering absolute elements that span across multiple print pages
const isBrowserPrintQuirky = /* true || */ (
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('firefox')
)

export function computeTimeGridPrintMode(
  forPrint: boolean,
  eventPrintLayout: 'auto' | 'stack' | 'grid' | undefined,
): TimeGridPrintMode {
  if (!forPrint) {
    return 'positioned'
  }

  return eventPrintLayout === 'stack' || (eventPrintLayout !== 'grid' && isBrowserPrintQuirky)
    ? 'stack'
    : 'positioned'
}
