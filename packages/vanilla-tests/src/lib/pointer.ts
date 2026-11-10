import { commands } from 'vitest/browser'

declare module 'vitest/browser' {
  interface BrowserCommands {
    mouseMove: (x: number, y: number, steps?: number) => Promise<void>
    mouseDown: () => Promise<void>
    mouseUp: () => Promise<void>
    touch: (type: 'touchStart' | 'touchMove' | 'touchEnd', x?: number, y?: number) => Promise<void>
  }
}

export interface Point {
  x: number
  y: number
}

let isPressed = false
let isTouching = false

/*
Real mouse input through Playwright. Points are client coordinates, as from getBoundingClientRect.
`move` sends intermediate mousemoves, because FullCalendar only starts a drag after the pointer
travels a few pixels and only updates the hit on a move.
*/
export const pointer = {
  async move(point: Point, steps = 5): Promise<void> {
    await commands.mouseMove(point.x, point.y, steps)
  },

  async down(point: Point): Promise<void> {
    await commands.mouseMove(point.x, point.y)
    await commands.mouseDown()
    isPressed = true
  },

  async up(): Promise<void> {
    isPressed = false
    await commands.mouseUp()
  },

  async click(point: Point): Promise<void> {
    await this.down(point)
    await this.up()
  },

  /*
  Presses at `from`, runs `whilePressed`, and always releases, so a failure mid-gesture doesn't
  leave the button held for the next test.
  */
  async press(from: Point, whilePressed: () => Promise<void>): Promise<void> {
    await this.down(from)
    try {
      await whilePressed()
    } finally {
      if (isPressed) {
        await this.up()
      }
    }
  },
}

/*
Real touch input through the Chrome DevTools Protocol. FullCalendar only starts touch drags and
selections after a long press, so `press` holds still for `holdMs` before running `whilePressed`.
Tests should set a short longPressDelay/eventLongPressDelay/selectLongPressDelay and hold a bit longer.
*/
export const touchPointer = {
  async move(point: Point, steps = 5): Promise<void> {
    const { lastPoint } = touchState

    for (let i = 1; i <= steps; i++) {
      const x = lastPoint.x + (point.x - lastPoint.x) * i / steps
      const y = lastPoint.y + (point.y - lastPoint.y) * i / steps
      await commands.touch('touchMove', x, y)
    }
    touchState.lastPoint = point
  },

  async press(from: Point, holdMs: number, whilePressed: () => Promise<void>): Promise<void> {
    await commands.touch('touchStart', from.x, from.y)
    isTouching = true
    touchState.lastPoint = from

    try {
      await new Promise((resolve) => setTimeout(resolve, holdMs)) // the long press itself
      await whilePressed()
    } finally {
      if (isTouching) {
        isTouching = false
        await commands.touch('touchEnd')
      }
    }
  },
}

const touchState = { lastPoint: { x: 0, y: 0 } }

/*
For teardown: ends a press left active by a test that failed or timed out mid-gesture.
*/
export async function releasePointer(): Promise<void> {
  if (isPressed) {
    await pointer.up()
  }
  if (isTouching) {
    isTouching = false
    await commands.touch('touchEnd')
  }
}

export function getRectCenter(rect: DOMRect): Point {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}
