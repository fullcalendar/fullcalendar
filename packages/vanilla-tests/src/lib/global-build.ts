/*
Loads a script with a classic script tag, the way a page loads the IIFE builds. Those aren't in the
packages' exports, so callers pass a URL, ex:
new URL('../../node_modules/fullcalendar/all/global.js', import.meta.url)
(Vite only rewrites `new URL()` with a literal path.) Each test file runs in its own iframe, so the
`FullCalendar` global doesn't leak between files.
*/
export function loadScript(url: URL): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptEl = document.createElement('script')
    scriptEl.src = url.href
    scriptEl.onload = () => resolve()
    scriptEl.onerror = () => reject(new Error(`Couldn't load ${url.href}`))
    document.head.appendChild(scriptEl)
  })
}

export function getGlobalFullCalendar(): any {
  return (window as any).FullCalendar
}
