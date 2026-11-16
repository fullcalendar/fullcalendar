/*
Tracks short-lived async work that leads to rendering (animation frames, short timers,
ResizeObserver deliveries), so automated tests can wait for rendering to finish instead of sleeping.
Long timers (now-indicator, scroll-end debounce, long-press delay) and drag auto-scrolling, which
runs for as long as the pointer stays near an edge, are deliberately not tracked.
*/

let pendingCnt = 0
let activityCnt = 0

/*
Marks async work as pending until the returned function is called (once).
*/
export function holdSettle(): () => void {
  let isReleased = false
  pendingCnt++

  return () => {
    if (!isReleased) {
      isReleased = true
      pendingCnt--
      activityCnt++
    }
  }
}

/*
Records that something happened that might lead to more rendering.
*/
export function markSettleActivity(): void {
  activityCnt++
}

export function settleRequestAnimationFrame(callback: () => void): void {
  const release = holdSettle()

  requestAnimationFrame(() => {
    try {
      callback()
    } finally {
      release()
    }
  })
}

const pendingTimeouts = new Map<number, () => void>()

export function settleSetTimeout(callback: () => void, ms?: number): number {
  const release = holdSettle()
  const id = setTimeout(() => {
    pendingTimeouts.delete(id)
    try {
      callback()
    } finally {
      release()
    }
  }, ms) as unknown as number

  pendingTimeouts.set(id, release)
  return id
}

export function settleClearTimeout(id: number): void {
  const release = pendingTimeouts.get(id)

  if (release) {
    pendingTimeouts.delete(id)
    clearTimeout(id)
    release()
  }
}

/*
Resolves once nothing tracked is pending and a whole animation frame has passed without activity.
ResizeObserver callbacks run after animation-frame callbacks within a frame, so activity is compared
between two consecutive frames rather than checked within one.
*/
export function whenSettled(): Promise<void> {
  return new Promise((resolve) => {
    let prevActivityCnt = -1

    function check() {
      if (!pendingCnt && activityCnt === prevActivityCnt) {
        resolve()
      } else {
        prevActivityCnt = activityCnt
        requestAnimationFrame(check)
      }
    }

    requestAnimationFrame(check)
  })
}
