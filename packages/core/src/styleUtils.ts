
const injectedStyleEls: HTMLStyleElement[] = []

const rootHasStyles = new WeakMap<ParentNode, true>()
rootHasStyles.set(document, true)

/*
Called from top-level core/plugin code
*/
export function injectStyles(css: string): void {
  if (css && typeof document !== 'undefined') {
    injectedStyleEls.push(injectStylesInParent(document.head, css))
  }
}

/*
Called during calendar initialization
*/
export function ensureElHasStyles(calendarEl: HTMLElement): void {
  const root = calendarEl.getRootNode() as ParentNode

  if (!rootHasStyles.get(root)) {
    rootHasStyles.set(root, true)

    for (const injectedStyleEl of injectedStyleEls) {
      injectStylesInParent(root, injectedStyleEl.innerText)
    }
  }
}

function injectStylesInParent(parentEl: Node, css: string): HTMLStyleElement {
  const style = document.createElement('style')

  const nonce = getNonceValue()
  if (nonce) {
    style.nonce = nonce
  }

  style.innerText = css
  parentEl.appendChild(style)
  return style
}

// nonce
// -------------------------------------------------------------------------------------------------

let queriedNonceValue: string | undefined

function getNonceValue() {
  if (queriedNonceValue === undefined) {
    queriedNonceValue = queryNonceValue()
  }
  return queriedNonceValue
}

function queryNonceValue() {
  const metaWithNonce = document.querySelector('meta[name="csp-nonce"]')

  if (metaWithNonce && metaWithNonce.hasAttribute('content')) {
    return metaWithNonce.getAttribute('content')
  }

  const elWithNonce = document.querySelector('script[nonce],link[nonce]')

  if (elWithNonce) {
    return (elWithNonce as any).nonce
  }

  return ''
}
