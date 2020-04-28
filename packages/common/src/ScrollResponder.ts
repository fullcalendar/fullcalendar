import { Duration } from './datelib/duration'
import { __assign } from 'tslib'
import { Emitter } from './common/Emitter'


export interface ScrollRequest {
  time?: Duration
  [otherProp: string]: any
}

export type ScrollRequestHandler = (request: ScrollRequest) => boolean


export class ScrollResponder {

  queuedRequest: ScrollRequest


  constructor(
    private execFunc: ScrollRequestHandler,
    private emitter: Emitter,
    private scrollTime: Duration
  ) {
    emitter.on('_scrollRequest', this.handleScrollRequest)
    this.fireInitialScroll()
  }


  detach() {
    this.emitter.off('_scrollRequest', this.handleScrollRequest)
  }


  update(isDatesNew: boolean) {
    if (isDatesNew) {
      this.fireInitialScroll() // will drain
    } else {
      this.drain()
    }
  }


  private fireInitialScroll() {
    this.handleScrollRequest({
      time: this.scrollTime
    })
  }


  private handleScrollRequest = (request: ScrollRequest) => {
    this.queuedRequest = __assign({}, this.queuedRequest || {}, request)
    this.drain()
  }


  private drain() {
    if (this.queuedRequest && this.execFunc(this.queuedRequest)) {
      this.queuedRequest = null
    }
  }

}
