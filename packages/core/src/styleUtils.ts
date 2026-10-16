import { warnOnce } from './util/v7.js'

const styleTexts: string[] = []
const styleEls = new Map<ParentNode, HTMLStyleElement>()

export function injectStyles(styleText: string): void {
  styleTexts.push(styleText)
  styleEls.forEach((styleEl) => {
    appendStylesTo(styleEl, styleText)
  })
}

export function ensureElHasStyles(el: HTMLElement): void {
  if (
    el.isConnected && // sometimes true if SSR system simulates DOM
    el.getRootNode // sometimes undefined if SSR system simulates DOM
  ) {
    registerStylesRoot(el.getRootNode() as ParentNode)
  }
}

function registerStylesRoot(rootNode: ParentNode): void {
  let styleEl: HTMLStyleElement = styleEls.get(rootNode)

  if (!styleEl || !styleEl.isConnected) {
    styleEl = rootNode.querySelector('style[data-fullcalendar]')

    if (!styleEl) {
      // the root might be a document other than the global one, like an iframe's (#7301)
      const isDocument = rootNode.nodeType === 9 // DOCUMENT_NODE
      const ownerDocument = isDocument ? rootNode as Document : (rootNode as Node).ownerDocument

      styleEl = ownerDocument.createElement('style')
      styleEl.setAttribute('data-fullcalendar', '')

      const nonce = getNonceValue()
      if (nonce) {
        styleEl.nonce = nonce
      }

      const parentEl = isDocument ? ownerDocument.head : rootNode
      const insertBefore = isDocument
        ? parentEl.querySelector('script,link[rel=stylesheet],link[as=style],style')
        : parentEl.firstChild

      parentEl.insertBefore(styleEl, insertBefore)
    }

    styleEls.set(rootNode, styleEl)
    hydrateStylesRoot(styleEl)
  }
}

function hydrateStylesRoot(styleEl: HTMLStyleElement): void {
  for (const styleText of styleTexts) {
    appendStylesTo(styleEl, styleText)
  }
}

function appendStylesTo(styleEl: HTMLStyleElement, styleText: string): void {
  const { sheet } = styleEl

  // null when inline styles are blocked by a Content Security Policy (#7353)
  if (!sheet) {
    warnOnce(
      'FullCalendar could not inject its styles, possibly because of a Content Security Policy. ' +
      'v7 distributes plain CSS files instead of injecting styles.',
    )
    return
  }

  const ruleCnt = sheet.cssRules.length

  styleText.split('}').forEach((styleStr, i) => {
    styleStr = styleStr.trim()
    if (styleStr) {
      sheet.insertRule(styleStr + '}', ruleCnt + i)
    }
  })
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

/*
TODO: discourage meta tag and instead put nonce attribute on placeholder <style> tag
*/
function queryNonceValue() {
  // sandboxed environments, like Salesforce's Lightning Web Security, can throw on these queries (#7439)
  try {
    const metaWithNonce = document.querySelector('meta[name="csp-nonce"]')

    if (metaWithNonce && metaWithNonce.hasAttribute('content')) {
      return metaWithNonce.getAttribute('content')
    }

    const elWithNonce = document.querySelector('script[nonce]')

    if (elWithNonce) {
      return (elWithNonce as any).nonce || ''
    }
  } catch (err) {
    // ignore
  }

  return ''
}

// main
// -------------------------------------------------------------------------------------------------

if (typeof document !== 'undefined') {
  registerStylesRoot(document)
}
