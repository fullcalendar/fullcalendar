((cssText) => {
  let applyStyles

  if (typeof document === 'undefined') {
    applyStyles = () => {}
  } else if (
    'adoptedStyleSheets' in Document.prototype &&
    'replaceSync' in CSSStyleSheet.prototype
  ) {
    const styleSheet = new CSSStyleSheet()
    styleSheet.replaceSync(cssText)
    applyStyles = (target = document) => {
      target.adoptedStyleSheets = [...target.adoptedStyleSheets, styleSheet]
    }
  } else {
    const styleEl = document.createElement('style')
    styleEl.textContent = cssText
    applyStyles = (target = document.head) => {
      target.appendChild(styleEl.parentNode ? styleEl.cloneNode(true) : styleEl)
    }
  }

  const oldApplyStyles = globalThis.__applyFullCalendarStyles
  globalThis.__applyFullCalendarStyles = (target) => {
    oldApplyStyles && oldApplyStyles(target)
    applyStyles(target)
  }

  applyStyles()
})({{{ cssTextAsJson }}})
