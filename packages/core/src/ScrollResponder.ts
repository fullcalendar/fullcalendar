import { Duration } from './datelib/duration.js'
import { Emitter } from './common/Emitter.js'
import { CalendarListeners } from './options.js'

export interface ScrollRequest {
  time?: Duration
  [otherProp: string]: any
}

export type ScrollRequestHandler = (request: ScrollRequest) => boolean

export class ScrollResponder {
  queuedRequest: ScrollRequest

  constructor(
    private execFunc: ScrollRequestHandler,
    private emitter: Emitter<CalendarListeners>,
    private scrollTime: Duration,
    private scrollTimeReset: boolean,
  ) {
    emitter.on('_scrollRequest', this.handleScrollRequest)
    this.fireInitialScroll()
  }

  detach() {
    this.emitter.off('_scrollRequest', this.handleScrollRequest)
  }

  update(isDatesNew: boolean) {
    if (isDatesNew && this.scrollTimeReset) {
      this.fireInitialScroll() // will drain
    } else {
      this.drain()
    }
  }

  private fireInitialScroll() {
    this.handleScrollRequest({
      time: this.scrollTime,
    })
  }

  private handleScrollRequest = (request: ScrollRequest) => {
    this.queuedRequest = Object.assign({}, this.queuedRequest || {}, request)
    this.drain()
  }

  private drain() {
    if (this.queuedRequest && this.execFunc(this.queuedRequest)) {
      this.queuedRequest = null
    }
  }
}
