
const styleTexts: string[] = []
const styleEndMarkers = new Map<Node, Node>()
const commentText = ' fullcalendar styles '

if (typeof document !== 'undefined') {
  registerStylesDest(
    document.head,
    document.head.querySelector('script,link,style'),
  )
}

export function injectStyles(styleText: string): void {
  styleTexts.push(styleText)
  styleEndMarkers.forEach((endMarker) => {
    injectStylesBefore(styleText, endMarker)
  })
}

export function registerStylesDest(parentEl: Node, insertBefore: Node | null): void {
  if (!styleEndMarkers.has(parentEl)) {
    const startMarker = document.createComment(commentText)
    const endMarker = document.createComment(` END${commentText}`)
    parentEl.insertBefore(endMarker, insertBefore)
    parentEl.insertBefore(startMarker, endMarker)
    styleEndMarkers.set(parentEl, endMarker)
    hydrateStylesDest(endMarker)
  }
}

function hydrateStylesDest(endMarker: Node): void {
  for (const styleText of styleTexts) {
    injectStylesBefore(styleText, endMarker)
  }
}

function injectStylesBefore(styleText: string, endMarker: Node): void {
  const styleNode = document.createElement('style')
  const nonce = getNonceValue()
  if (nonce) {
    styleNode.nonce = nonce
  }
  styleNode.innerText = styleText
  endMarker.parentNode.insertBefore(styleNode, endMarker)
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

  const elWithNonce = document.querySelector('script[nonce]')

  if (elWithNonce) {
    return (elWithNonce as any).nonce || ''
  }

  return ''
}
