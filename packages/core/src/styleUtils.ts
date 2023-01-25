
export function injectStyles(css: string): void {
  if (!css || typeof document === 'undefined') { return }

  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.type = 'text/css'

  const nonce = getNonceValue()
  if (nonce) {
    style.nonce = nonce
  }

  head.appendChild(style)

  if ((style as any).styleSheet) {
    (style as any).styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }
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
