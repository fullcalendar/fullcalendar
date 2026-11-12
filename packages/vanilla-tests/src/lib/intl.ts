/*
Helpers for comparing Intl-formatted text. Works in the browser and in Node.
*/

// The separator Intl puts between the two dates of an en-US range (ex: ' – ', with thin spaces in some ICU versions)
export const enUsSep = getRangeSeparatorForLocale('en-US')

// Intl output can use typographically different space characters across ICU versions
export function normalizeIntlWhitespace(s: string): string {
  return s.replace(/[   ]/g, ' ')
}

function getRangeSeparatorForLocale(locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const parts = formatter.formatRangeToParts(
    new Date('2014-06-13T01:00:00'),
    new Date('2014-06-13T02:00:00'),
  )
  const sharedPart = parts.find(
    (part) => part.source === 'shared' && part.type === 'literal' && !/^[\s,]*$/.test(part.value),
  )

  if (!sharedPart) {
    throw new Error('Expected Intl.DateTimeFormat.formatRangeToParts() to produce a shared separator.')
  }

  return sharedPart.value
}

/*
Texts of the element's descendants that have no element children, in document order, trimmed, empty ones
excluded. Event time and title elements aren't marked as parts, so tests find them by their text.
*/
export function getLeafTexts(el: Element): string[] {
  return Array.from(el.querySelectorAll('*'))
    .filter((child) => child.children.length === 0)
    .map((child) => (child.textContent || '').trim())
    .filter((text) => text !== '')
}
