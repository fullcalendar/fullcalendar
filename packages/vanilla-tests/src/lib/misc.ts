
export function waitFrame() {
  return new Promise(requestAnimationFrame)
}

export function waitTimeout(ms = 100) {
  return new Promise((successCallback) => setTimeout(successCallback, ms))
}

// ---

/*
All actions within function `f` that trigger a ResizeObserver loop, errors are ignored,
preventing Karma from choking. Normally, fix the root cause of the error, especially if it
occurs on calendar load. However, for more obscure scenarios, and scenarios that are triggered
by user actions, the loop is more okay, so you can use this HACK.
*/
export async function ignoreResizeObserverLoops(f: () => Promise<void>): Promise<void> {
  const originalOnError = window.onerror

  window.onerror = (message, ...args) => {
    if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
      return true // prevents Karma from seeing it as uncaught
    }
    return originalOnError?.(message, ...args)
  }

  await f()
  window.onerror = originalOnError
}

// ---

export const enUsSep = getRangeSeparatorForLocale('en-US')
export const enGbSep = getRangeSeparatorForLocale('en-GB')

// Utils
// -----

function getRangeSeparatorForLocale(locale: string): string {
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const dateTimeStart = new Date('2014-06-13T01:00:00')
  const dateTimeEnd = new Date('2014-06-13T02:00:00')

  return getRangeSeparator(dateTimeFormatter.formatRangeToParts(dateTimeStart, dateTimeEnd))
}

function getRangeSeparator(parts: Intl.DateTimeRangeFormatPart[]): string {
  const sharedPart = parts.find(
    part => part.source === 'shared' && part.type === 'literal' && !/^[\s,]*$/.test(part.value)
  )

  if (!sharedPart) {
    throw new Error('Expected Intl.DateTimeFormat.formatRangeToParts() to produce a shared separator.')
  }

  return sharedPart.value
}
