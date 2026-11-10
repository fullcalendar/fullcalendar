import type { BrowserCommand } from 'vitest/node'

/*
Real browser input, run in Node through Playwright. Tests call these through src/lib/pointer.ts.

Coordinates are client coordinates within the test iframe (what getBoundingClientRect returns).
Playwright's page.mouse works in top-page coordinates, so the iframe's offset is added.
*/

type Ctx = Parameters<BrowserCommand<[]>>[0]

// The iframe doesn't move during a test file, so its offset is measured once per browser session
const iframeOffsets = new Map<string, Promise<{ x: number, y: number }>>()

function getIframeOffset(ctx: Ctx): Promise<{ x: number, y: number }> {
  let offset = iframeOffsets.get(ctx.sessionId)

  if (!offset) {
    offset = measureIframeOffset(ctx)
    iframeOffsets.set(ctx.sessionId, offset)
  }
  return offset
}

async function measureIframeOffset(ctx: Ctx): Promise<{ x: number, y: number }> {
  const iframeEl = ctx.iframe.owner()
  const box = await iframeEl.boundingBox()
  const cssWidth = await iframeEl.evaluate((el: HTMLElement) => el.offsetWidth)

  if (!box) {
    throw new Error('Test iframe is not visible')
  }

  // Vitest CSS-scales the iframe when it doesn't fit the page. That would break coordinates
  if (Math.abs(box.width / cssWidth - 1) > 0.001) {
    throw new Error(`Test iframe is scaled by ${box.width / cssWidth}. Make the viewports match`)
  }

  return { x: box.x, y: box.y }
}

async function toPagePoint(ctx: Ctx, x: number, y: number): Promise<{ x: number, y: number }> {
  const offset = await getIframeOffset(ctx)
  return { x: offset.x + x, y: offset.y + y }
}

export const mouseMove: BrowserCommand<[x: number, y: number, steps?: number]> = async (ctx, x, y, steps = 1) => {
  const point = await toPagePoint(ctx, x, y)
  await (ctx as any).page.mouse.move(point.x, point.y, { steps })
}

export const mouseDown: BrowserCommand<[]> = async (ctx) => {
  await (ctx as any).page.mouse.down()
}

export const mouseUp: BrowserCommand<[]> = async (ctx) => {
  await (ctx as any).page.mouse.up()
}

// Touch, through the Chrome DevTools Protocol. Playwright's touchscreen can only tap.

const cdpSessions = new Map<string, Promise<any>>()

function getCdpSession(ctx: Ctx): Promise<any> {
  let session = cdpSessions.get(ctx.sessionId)

  if (!session) {
    const page = (ctx as any).page
    session = page.context().newCDPSession(page)
    cdpSessions.set(ctx.sessionId, session)
  }
  return session
}

export const touch: BrowserCommand<[type: 'touchStart' | 'touchMove' | 'touchEnd', x?: number, y?: number]> = async (
  ctx,
  type,
  x = 0,
  y = 0,
) => {
  const session = await getCdpSession(ctx)
  const point = await toPagePoint(ctx, x, y)

  await session.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchEnd' ? [] : [{ x: point.x, y: point.y }],
  })
}
