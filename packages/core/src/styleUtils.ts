
export function injectStyles(css: string): void {
  if (!css || typeof document === 'undefined') { return }

  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.type = 'text/css'
  head.appendChild(style)

  if ((style as any).styleSheet) {
    (style as any).styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }
}
